// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  cy.contains('button', 'Ingresar').click()
})