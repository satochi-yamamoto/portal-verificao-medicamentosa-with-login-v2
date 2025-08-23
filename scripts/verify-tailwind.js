#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

console.log('🔍 Verificando configuração do Tailwind CSS...\n')

// 1. Check package versions
console.log('1. Verificando versões dos pacotes...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const requiredPackages = {
  'tailwindcss': '3.x',
  'postcss': '8.x', 
  'autoprefixer': '10.x',
  'vite': '5.x'
}

Object.entries(requiredPackages).forEach(([pkg, expectedVersion]) => {
  const version = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  if (version) {
    console.log(`   ✅ ${pkg}: ${version}`)
  } else {
    console.log(`   ❌ ${pkg}: NÃO ENCONTRADO`)
  }
})

// 2. Check configuration files
console.log('\n2. Verificando arquivos de configuração...')
const configFiles = [
  'tailwind.config.js',
  'postcss.config.js', 
  'vite.config.js',
  'src/index.css'
]

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} existe`)
  } else {
    console.log(`   ❌ ${file} NÃO ENCONTRADO`)
  }
})

// 3. Check tailwind.config.js content
console.log('\n3. Verificando conteúdo do tailwind.config.js...')
if (fs.existsSync('tailwind.config.js')) {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8')
  
  const checks = [
    { name: 'content paths', regex: /content:\s*\[[\s\S]*?["']\.\/src\/\*\*\/\*\.{[^}]+}["'][\s\S]*?\]/, required: true },
    { name: 'index.html included', regex: /["']\.\/index\.html["']/, required: true },
    { name: 'src/**/*.{js,jsx,ts,tsx} pattern', regex: /src\/\*\*\/\*\.\{[^}]*jsx?[^}]*\}/, required: true }
  ]
  
  checks.forEach(check => {
    if (check.regex.test(tailwindConfig)) {
      console.log(`   ✅ ${check.name}`)
    } else {
      console.log(`   ❌ ${check.name} - configuração pode estar incorreta`)
    }
  })
} else {
  console.log('   ❌ Arquivo não encontrado para verificação')
}

// 4. Check CSS imports
console.log('\n4. Verificando importação do CSS...')
if (fs.existsSync('src/main.jsx')) {
  const mainContent = fs.readFileSync('src/main.jsx', 'utf8')
  
  if (mainContent.includes("import './index.css'")) {
    console.log('   ✅ CSS importado em src/main.jsx')
  } else if (mainContent.includes("import") && mainContent.includes(".css")) {
    console.log('   ⚠️  CSS importado mas nome do arquivo pode estar diferente')
  } else {
    console.log('   ❌ Importação do CSS NÃO ENCONTRADA em src/main.jsx')
  }
} else {
  console.log('   ❌ src/main.jsx não encontrado')
}

// 5. Check CSS content
console.log('\n5. Verificando conteúdo do CSS...')
if (fs.existsSync('src/index.css')) {
  const cssContent = fs.readFileSync('src/index.css', 'utf8')
  
  const cssChecks = [
    { name: '@tailwind base', regex: /@tailwind\s+base/, required: true },
    { name: '@tailwind components', regex: /@tailwind\s+components/, required: true },
    { name: '@tailwind utilities', regex: /@tailwind\s+utilities/, required: true },
    { name: 'custom components', regex: /@layer\s+components/, required: false },
    { name: 'custom classes (.btn, .card)', regex: /\.btn|\.card/, required: false }
  ]
  
  cssChecks.forEach(check => {
    if (check.regex.test(cssContent)) {
      console.log(`   ✅ ${check.name}`)
    } else if (check.required) {
      console.log(`   ❌ ${check.name} - OBRIGATÓRIO`)
    } else {
      console.log(`   ⚠️  ${check.name} - opcional, não encontrado`)
    }
  })
} else {
  console.log('   ❌ src/index.css não encontrado')
}

// 6. Check PostCSS config
console.log('\n6. Verificando configuração PostCSS...')
if (fs.existsSync('postcss.config.js')) {
  const postcssConfig = fs.readFileSync('postcss.config.js', 'utf8')
  
  if (postcssConfig.includes('tailwindcss') && postcssConfig.includes('autoprefixer')) {
    console.log('   ✅ PostCSS configurado com Tailwind e Autoprefixer')
  } else {
    console.log('   ❌ PostCSS não configurado corretamente')
  }
} else {
  console.log('   ❌ postcss.config.js não encontrado')
}

// 7. Check Vite config
console.log('\n7. Verificando configuração do Vite...')
if (fs.existsSync('vite.config.js')) {
  const viteConfig = fs.readFileSync('vite.config.js', 'utf8')
  
  if (viteConfig.includes('postcss')) {
    console.log('   ✅ Vite configurado para processar PostCSS')
  } else {
    console.log('   ⚠️  Vite pode não estar configurado para PostCSS')
  }
} else {
  console.log('   ❌ vite.config.js não encontrado')
}

// 8. Check TailwindTest component
console.log('\n8. Verificando componente de teste...')
if (fs.existsSync('src/components/TailwindTest.jsx')) {
  console.log('   ✅ TailwindTest.jsx existe')
  
  // Check if it's in App.jsx routes
  if (fs.existsSync('src/App.jsx')) {
    const appContent = fs.readFileSync('src/App.jsx', 'utf8')
    if (appContent.includes('TailwindTest') || appContent.includes('tailwind-test')) {
      console.log('   ✅ Rota /tailwind-test configurada no App.jsx')
    } else {
      console.log('   ⚠️  Rota /tailwind-test pode não estar configurada')
    }
  }
} else {
  console.log('   ❌ TailwindTest.jsx não encontrado')
}

console.log('\n📋 RESUMO DA VERIFICAÇÃO:')
console.log('✅ = Funcionando corretamente')
console.log('⚠️  = Pode precisar de atenção')
console.log('❌ = Problema que precisa ser corrigido')

console.log('\n🧪 PRÓXIMOS PASSOS PARA TESTAR:')
console.log('1. npm run dev')
console.log('2. Navegue para http://localhost:3000/tailwind-test')
console.log('3. Verifique se vê cores, espaçamentos e animações')
console.log('4. npm run build (deve compilar sem erros)')

console.log('\n💡 SE OS ESTILOS NÃO FUNCIONAREM:')
console.log('- Limpe o cache: rm -rf node_modules dist .vite && npm install')
console.log('- Force rebuild: npm run dev -- --force')
console.log('- Verifique o navegador (F12 → Console) por erros CSS')

console.log('\n🎯 DIAGNÓSTICO COMPLETO!')