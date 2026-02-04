export async function waitForImages(root: HTMLElement, timeoutMs = 2500) {
  const imgs = Array.from(root.querySelectorAll("img"));

  // Filter out images that are already complete with naturalHeight > 0 (loaded successfully)
  // or complete but failed (naturalHeight === 0, but complete is true).
  // We want to wait for anything that is NOT complete.
  const pending = imgs.filter((img) => !img.complete);

  if (!pending.length) {
    // Even if all are complete, give a tiny buffer for decoding
    await new Promise((r) => setTimeout(r, 100));
    return;
  }

  const loadPromises = pending.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
          return;
        }
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      })
  );

  await Promise.race([
    Promise.all(loadPromises),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

/**
 * Convert an image URL to a base64 data URL.
 * Uses server-side proxy to bypass CORS issues.
 */
export async function imageUrlToBase64(url: string, timeoutMs = 10000): Promise<string | null> {
  // Skip if already a data URL
  if (url.startsWith("data:")) {
    return url;
  }

  // For local placeholders, return as-is
  if (url.startsWith("/")) {
    return url;
  }

  try {
    // Use server-side proxy to fetch the image
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[PDF] Proxy failed for: ${url}, status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.dataUrl) {
      console.log(`[PDF] Successfully converted via proxy: ${url.substring(0, 50)}...`);
      return data.dataUrl;
    }

    console.warn(`[PDF] No dataUrl in response for: ${url}`);
    return null;
  } catch (err) {
    console.warn(`[PDF] Failed to convert image via proxy: ${url}`, err);
    return null;
  }
}

/**
 * Convert multiple image URLs to base64 in parallel using server-side proxy.
 * Returns a map of original URL -> base64 data URL.
 * Failed conversions are not included in the map.
 */
export async function imagesToBase64(urls: string[]): Promise<Map<string, string>> {
  console.log(`[PDF] Starting to convert ${urls.length} images to base64 via proxy...`);
  const results = new Map<string, string>();

  // Process in batches to avoid overwhelming the server
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      const base64 = await imageUrlToBase64(url);
      if (base64) {
        results.set(url, base64);
      }
    });
    await Promise.all(promises);
  }

  console.log(`[PDF] Successfully converted ${results.size} of ${urls.length} images`);
  return results;
}

export function makeSafeFilePart(value: string) {
  return value.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function exportElementAsPdf(opts: {
  element: HTMLElement;
  fileName: string;
  backgroundColor?: string;
}) {
  const { element, fileName, backgroundColor = "#ffffff" } = opts;

  await waitForImages(element, 5000);
  // Let the browser paint any final layout changes.
  await new Promise((r) => setTimeout(r, 100));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Capture links before rasterization
  const links = Array.from(element.querySelectorAll("a")).map((a) => {
    const rect = a.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      href: a.href,
      // Coordinates relative to the captured element
      x: rect.left - elementRect.left,
      y: rect.top - elementRect.top,
      width: rect.width,
      height: rect.height,
    };
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    imageTimeout: 5000,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Calculate scale factor between CSS pixels and PDF units (mm)
  // We use element.offsetWidth because link coordinates are in CSS pixels
  const elementWidth = element.offsetWidth;
  const cssScale = pdfWidth / elementWidth;

  // Aspect ratio scale for the captured image
  const imgScale = pdfWidth / canvas.width;
  const imgHeight = canvas.height * imgScale;

  let heightLeft = imgHeight;
  let position = 0;

  // Function to add links for the current page
  const addLinksForPage = (offsetYr: number) => {
    links.forEach((link) => {
      // Calculate link position in PDF units
      const linkX = link.x * cssScale;
      const linkY = link.y * cssScale - offsetYr;
      const linkW = link.width * cssScale;
      const linkH = link.height * cssScale;

      // Check if link is visible on this page
      if (linkY >= 0 && linkY + linkH <= pdfHeight) {
        console.log(`[PDF] Adding link at ${linkX},${linkY} on first page`);
        pdf.link(linkX, linkY, linkW, linkH, { url: link.href });
      }
    });
  };

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
  addLinksForPage(0); // Add links for the first page
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = position - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");

    // Add links for subsequent pages
    // The offset in PDF units is basically the cumulative height of previous pages
    // Since we are shifting the image up (position is negative), we need to calculate 
    // the relative Y of the link on this new page.

    // Actually, simpler logic:
    // The captured image is one giant long image.
    // 'position' becomes -297, -594, etc. (for A4 height ~297mm)
    // The Y coordinate on the PDF page = (link.y * scale) + position

    links.forEach((link) => {
      const linkY_on_canvas_scaled = link.y * cssScale;
      const linkY_on_page = linkY_on_canvas_scaled + position; // position is negative
      const linkW = link.width * cssScale;
      const linkH = link.height * cssScale;
      const linkX = link.x * cssScale;

      if (linkY_on_page >= 0 && linkY_on_page + linkH <= pdfHeight) {
        console.log(`[PDF] Adding link at ${linkX},${linkY_on_page} on page`);
        pdf.link(linkX, linkY_on_page, linkW, linkH, { url: link.href });
      }
    });

    heightLeft -= pdfHeight;
  }

  pdf.save(fileName);
}


/**
 * Generate PDF from element and return as Blob.
 * Used for iOS native apps where direct download doesn't work.
 */
export async function generatePdfAsBlob(opts: {
  element: HTMLElement;
  backgroundColor?: string;
}): Promise<Blob> {
  const { element, backgroundColor = "#ffffff" } = opts;

  await waitForImages(element, 5000);
  await new Promise((r) => setTimeout(r, 100));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    imageTimeout: 5000,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgScale = pdfWidth / canvas.width;
  const imgHeight = canvas.height * imgScale;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = position - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;
  }

  // Return as Blob
  return pdf.output("blob");
}
