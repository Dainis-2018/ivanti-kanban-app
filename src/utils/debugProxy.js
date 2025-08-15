// utils/debugProxy.js - Debug utility for proxy issues
export const debugProxy = () => {
  if (!import.meta.env.DEV) {
    return
  }

  console.group('🔧 Proxy Debug Information')
  
  console.log('Environment:', import.meta.env.MODE)
  console.log('Development Mode:', import.meta.env.DEV)
  console.log('Base URL:', import.meta.env.BASE_URL)
  console.log('Proxy Target:', import.meta.env.VITE_PROXY_TARGET)
  console.log('OData Endpoint:', import.meta.env.VITE_ODATA_ENDPOINT)
  console.log('API Key (first 10 chars):', import.meta.env.VITE_API_KEY?.substring(0, 10) + '...')
  
  // Test URL construction
  const testUrls = [
    '/api/odata/businessObject/frs_projects',
    '/api/odata/businessObject/frs_prj_phases',
    '/api/odata/businessObject/task__assignments'
  ]
  
  console.log('Expected URLs in development:')
  testUrls.forEach(url => {
    const target = (import.meta.env.VITE_PROXY_TARGET || 'https://ivanti').replace(/\/+$/, '')
    const rewrittenPath = url.replace('/api', '/HEAT/api')
    console.log(`  ${url} -> ${target}${rewrittenPath}`)
  })
  
  console.groupEnd()
}

// Function to test if proxy is working
export const testProxy = async () => {
  if (!import.meta.env.DEV) {
    console.log('Proxy test is only available in development mode')
    return
  }

  console.log('🧪 Testing proxy connection...')
  
  try {
    // Test basic connectivity
    const testUrl = '/api/odata/businessObject/frs_projects?$top=1'
    console.log(`Testing URL: ${testUrl}`)
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.text()
      console.log('✅ Proxy is working! Response preview:', data.substring(0, 200) + '...')
    } else {
      console.error('❌ Proxy test failed:', response.statusText)
    }
  } catch (error) {
    console.error('❌ Proxy test error:', error)
  }
}

// Add to window for manual testing in browser console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.debugProxy = debugProxy
  window.testProxy = testProxy
  
  // Auto-run debug info
  setTimeout(debugProxy, 1000)
}