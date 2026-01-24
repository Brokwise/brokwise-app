import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data: propertyData, type } = await request.json();
  const enquiryPrompt = `
  You are an AI assistant that writes clear and natural property enquiry descriptions.
  
  Guidelines:
  - Write in first person (e.g., "I am looking for...")
  - Be concise and professional
  - Use plain text only (no markdown, no bullet points)
  - Maximum 100 words
  - Do not invent details that are not present in the data
  
  Input (property requirements):
  ${JSON.stringify(propertyData)}
  
  Output:
  A short paragraph describing the property enquiry.
  `;

  const propertyPrompt = `
  You are an AI assistant that writes engaging real estate property descriptions.
  
  Guidelines:
  - Write in third person
  - Highlight key features and selling points
  - Keep the tone professional and appealing
  - Use plain text only (no markdown, no bullet points)
  - Maximum 100 words
  - Do not add features that are not in the data
  
  Input (property details):
  ${JSON.stringify(propertyData)}
  
  Output:
  A short paragraph suitable for a real estate listing.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: type === "enquiry" ? enquiryPrompt : propertyPrompt,
        },
      ],
    }),
  });

  const data = await response.json();
  return NextResponse.json({ description: data.choices[0].message.content });
}
