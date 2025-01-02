// app/api/scrape-profile/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // Validate URL
    if (!url) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL is required' 
      }, { status: 400 });
    }

    // Log the request
    console.log('Attempting to scrape:', url);
    console.log('Using API key:', process.env.FIRECRAWL_API_KEY ? 'Present' : 'Missing');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 60000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firecrawl API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Firecrawl API error: ${response.status} ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return NextResponse.json({
      success: true,
      content: Array.isArray(data.data) 
        ? data.data.map(page => page.markdown).join('\n\n---\n\n')
        : data.data?.markdown || 'No content found'
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Scraping error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to scrape profile'
    }, { status: 500 });
  }
}
