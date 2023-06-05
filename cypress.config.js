const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  env:{
    email: "katerinamarakhovskaya@gmail.com", 
    password: "Krist230294",
    apiUrl:"https://api.realworld.io"
  },
  //запускать потом - під час запуску DB_USERNAME='нейм' PASSWORD='пароль' npm run cy:open_process
  e2e: {

    setupNodeEvents(on, config){
      const email = process.env.DB_USERNAME
      const password = process.env.PASSWORD

      if(!password){
        throw new Error('missing PASSWORD environment variable')
      }

      config.env = {email, password}

      return config

    },
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern:['**/1-getting-started/*', '**/2-advanced-examples/*']
  },
})