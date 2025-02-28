
//<reference types='cypress'/>

describe('test logout', () => {

    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

 it('verify use can log out successfully', () => {

    cy.contains('Settings').click()
    cy.contains('Or click here to logout').click()
    cy.get('.navbar-nav').should('contain','Sign up')

 })

})