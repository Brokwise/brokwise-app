import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data: propertyData } = await request.json();
  console.log(propertyData);
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
          content: `You are a helpful assistant that generates descriptions for properties. Do not include Markdown formatting. The description should be under 100 words. The property data is as follows: ${JSON.stringify(
            propertyData
          )}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return NextResponse.json({ description: data.choices[0].message.content });
}
