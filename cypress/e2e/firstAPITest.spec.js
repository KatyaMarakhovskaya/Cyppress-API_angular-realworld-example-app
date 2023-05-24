describe('Test with backend', () => {
    // mocking response - chanche values in responsce
    //intersept should be before we login to the application
    //files with JSON we create in folder fixture
    
    beforeEach('login to the app', ()=>{
        //cypress use this intercept as a replacment for real responce
        cy.intercept({method:'GET', path:'tags'}, {fixture:'tags.json'} )
        cy.loginToApplication()
    })

    it("Verify correct request and respose ", () => {
        //intercept should be at the begin
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Article tittle5')
        cy.get('[formcontrolname="description"]').type("Article about something")
        cy.get('[formcontrolname="body"]').type("Article body")
        cy.contains(" Publish Article ").click()

        cy.wait('@postArticles').then( xhr => {
            console.log( xhr )
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('Article body')
            expect(xhr.response.body.article.description).to.equal('Article about something')

        })
    })

    it("intersepting and modifyng the request and responce", () => {
        //intercept and change REQUEST
        //cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
         //   req.body.article.description = "NEW DESCRIPTION"
        //}).as('postArticles')

        //intercept and change RESPONCE
        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
            req.reply( res => {
                expect(res.body.article.description).to.equal('Article about something')
                res.body.article.description = "This is a NEW DESCRIPTION"
            })
        }).as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('Article titt4')
        cy.get('[formcontrolname="description"]').type("Article about something")
        cy.get('[formcontrolname="body"]').type("Article body")
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then( xhr => {
            console.log( xhr )
           // expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('Article body')
            expect(xhr.response.body.article.description).to.equal("This is a NEW DESCRIPTION")

        })
    })

    it('verify  popular tags are displayed', () => {
        cy.log('we logged in')
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
    })

    it('verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'} )
    
        cy.contains('Global Feed').click()
        cy.get('app-article-preview button').then( heartList => {
            console.log(heartList)
           expect(heartList[0]).to.contain('1')
           expect(heartList[1]).to.contain('5')
        })

        // method fixture allow us to read files from fixture folder
        //by default it read json (it is not nessesery to add .JSOn to name)
        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6

            // we took object from JSON file and changed value to
            cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)


            cy.get('app-article-preview button').eq(1).click().should('contain', '6')
        })     
    })

    it.only('deleting a new article in global feed', () =>{

       
        cy.get('@token').then(token =>{

           

            const bodyRequest = { 
                "article":   {
                        "tagList": [],
                        "title": "Requesrt from API553",
                        "description": "API is easy2",
                        "body": "Angular is cool"
                        }
            }

            cy.request({
                url: 'https://api.realworld.io/api/articles/',
                headers: {'Authorization': 'Token '+ token},
                method: 'POST',
                body: bodyRequest
            }).then( response => {
                expect(response.status).to.equal(200)
            })

            cy.contains('Global Feed').click()
            cy.get('app-article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()

            
                cy.request({
                    url:'https://api.realworld.io/api/articles?limit=10&offset=0',
                    headers:{'Authorization': 'Token '+ token},
                    method:'GET'
                }).its('body').then(body => {
                    console.log(body)
                    //expect(body.articles[0].title).not.to.equal('Requesrt from API3')
                })
            
        })
    })

})