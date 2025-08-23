#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🔍 Verificando configuração do React Router v7...\n')

// Verificar package.json
console.log('1. Verificando versão do React Router...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const routerVersion = packageJson.dependencies['react-router-dom']
console.log(`   ✅ React Router DOM: ${routerVersion}`)

if (routerVersion.includes('7.') || routerVersion.includes('^7.')) {
  console.log('   ✅ Versão 7.x detectada!')
} else {
  console.log('   ❌ Versão não é 7.x!')
  process.exit(1)
}

// Verificar App.jsx
console.log('\n2. Verificando configuração no App.jsx...')
const appContent = fs.readFileSync('src/App.jsx', 'utf8')

const checks = [
  {
    name: 'createBrowserRouter import',
    regex: /import.*createBrowserRouter.*from ['"]react-router-dom['"]/,
    required: true
  },
  {
    name: 'RouterProvider import',
    regex: /import.*RouterProvider.*from ['"]react-router-dom['"]/,
    required: true
  },
  {
    name: 'v7_startTransition future flag',
    regex: /v7_startTransition:\s*true/,
    required: true
  },
  {
    name: 'v7_relativeSplatPath future flag',
    regex: /v7_relativeSplatPath:\s*true/,
    required: true
  },
  {
    name: 'BrowserRouter as Router usage (deve ser removido)',
    regex: /BrowserRouter as Router|<Router>/,
    required: false
  },
  {
    name: 'Routes/Route pattern (deve ser substituído)',
    regex: /<Routes>.*<Route/s,
    required: false
  }
]

let allPassed = true

checks.forEach(check => {
  const found = check.regex.test(appContent)
  
  if (check.required) {
    if (found) {
      console.log(`   ✅ ${check.name}`)
    } else {
      console.log(`   ❌ ${check.name} - NÃO ENCONTRADO`)
      allPassed = false
    }
  } else {
    if (found) {
      console.log(`   ⚠️  ${check.name} - AINDA PRESENTE (deveria ser removido)`)
    } else {
      console.log(`   ✅ ${check.name} - Removido corretamente`)
    }
  }
})

// Verificar hooks personalizados
console.log('\n3. Verificando hooks personalizados...')
const hookFiles = [
  'src/hooks/useRouterMonitoring.js',
  'src/hooks/useOptimizedNavigation.js'
]

hookFiles.forEach(hookFile => {
  if (fs.existsSync(hookFile)) {
    console.log(`   ✅ ${hookFile} existe`)
  } else {
    console.log(`   ❌ ${hookFile} não encontrado`)
    allPassed = false
  }
})

// Verificar Layout.jsx
console.log('\n4. Verificando otimizações no Layout...')
const layoutContent = fs.readFileSync('src/components/Layout.jsx', 'utf8')

if (layoutContent.includes('useRouterMonitoring')) {
  console.log('   ✅ Layout usando useRouterMonitoring')
} else {
  console.log('   ⚠️  Layout não está usando useRouterMonitoring')
}

if (layoutContent.includes('isNavigating')) {
  console.log('   ✅ Layout mostra indicador de carregamento')
} else {
  console.log('   ⚠️  Layout não tem indicador de carregamento')
}

// Verificar estrutura de rotas
console.log('\n5. Verificando estrutura de rotas...')
const routePattern = /children:\s*\[([\s\S]*?)\]/
const routeMatch = appContent.match(routePattern)

if (routeMatch) {
  const routesContent = routeMatch[1]
  const indexRoute = routesContent.includes('index: true')
  const childRoutes = (routesContent.match(/path:/g) || []).length
  
  console.log(`   ✅ Estrutura de rotas aninhadas encontrada`)
  console.log(`   ${indexRoute ? '✅' : '⚠️'} ${indexRoute ? 'Index route configurado' : 'Index route não encontrado'}`)
  console.log(`   ✅ ${childRoutes} rotas filhas encontradas`)
} else {
  console.log('   ❌ Estrutura de rotas aninhadas não encontrada')
  allPassed = false
}

console.log('\n📋 RESUMO:')
if (allPassed) {
  console.log('🎉 TODAS AS VERIFICAÇÕES PASSARAM!')
  console.log('✅ React Router v7 configurado corretamente')
  console.log('✅ Future flags habilitados')
  console.log('✅ Hooks de otimização implementados')
  console.log('✅ Estrutura de rotas moderna')
  console.log('\n🚀 Pronto para produção!')
} else {
  console.log('❌ ALGUMAS VERIFICAÇÕES FALHARAM!')
  console.log('Por favor, corrija os problemas acima antes de continuar.')
  process.exit(1)
}

console.log('\n🔧 Para testar manualmente:')
console.log('1. npm run dev')
console.log('2. Abra o console do navegador')
console.log('3. Navegue entre as páginas')
console.log('4. Verifique se NÃO há warnings sobre "React Router Future Flag"')
console.log('5. npm run build (deve compilar sem erros)')