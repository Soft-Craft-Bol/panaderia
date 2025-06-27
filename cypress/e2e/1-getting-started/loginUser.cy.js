
describe('Flujo completo: Login → Home → Productos en Venta', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Debe navegar correctamente a Productos en Venta después del login', () => {
    // 1. Mockear login exitoso
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        jwt: 'fake-jwt-token',
        username: 'Gaspar',
        roles: ['ROLE_VENDEDOR'], // Rol necesario para ver Productos en Venta
        photo: 'foto.jpg',
        puntosVenta: []
      }
    }).as('loginRequest');

    // 2. Realizar login
    cy.get('input[name="username"]').type('Gaspar');
    cy.get('input[name="password"]').type('armando1gaspar');
    cy.contains('button', 'Ingresar').click();

    // 3. Verificar redirección a home
    cy.url().should('include', '/home');
    
   cy.get(':nth-child(4) > a > .text')
    
  });
});