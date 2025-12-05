import React from 'react'

export interface EmailRenderResult {
  html: string
  subject: string
}

/**
 * Render a React email template to HTML string
 */
export async function renderEmailTemplate<P extends object>(
  Template: React.ComponentType<P>,
  props: P,
  subject: string
): Promise<EmailRenderResult> {
  // Dynamic import to avoid build issues with react-dom/server in API routes
  const { renderToStaticMarkup } = await import('react-dom/server')

  const html = renderToStaticMarkup(
    React.createElement(Template, props)
  )

  return {
    html: `<!DOCTYPE html>${html}`,
    subject,
  }
}
