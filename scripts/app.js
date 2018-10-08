$(()=>{
    const app = Sammy('#container', function () {
        this.use('Handlebars', 'hbs');

        this.get('index.html',function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }
            ctx.loadPartials({
                navbar: './templates/common/navbar.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/main.hbs')
            })
        });

        this.get('#/main',function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }
            ctx.loadPartials({
                navbar: './templates/common/navbar.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/main.hbs')
            })
        });
        
        this.get('#/register',function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }
            ctx.loadPartials({
                navbar: './templates/common/navbar.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/register.hbs')
            })
        })

        this.get('#/login',function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }
            ctx.loadPartials({
                navbar: './templates/common/navbar.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/login.hbs')
            })
        })

        this.post('#/register',function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let repeatPass = ctx.params.repeatPass;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                showError('Password should be at least 6 characters long and contain only digits and english alphabet letters');
            } else if (repeatPass !== password) {
                showError('Passwords must match!');
            } else {
                kinveyController.register(username, password).then(function (res) {
                    kinveyController.saveAuthInSession(res)
                    showInfo('User registration successful!')
                    ctx.redirect('#/catalog')
                }).catch(kinveyController.handleError);

            }
        })

        this.post('#/login',function (ctx) {
            let username = ctx.params.username;
            let password = ctx.params.password;

            if (!/^[A-Za-z]{3,}$/.test(username)) {
                showError('Username should be at least 3 characters long and contain only english alphabet letters');
            } else if (!/^[A-Za-z0-9]{6,}$/.test(password)) {
                showError('Password should be at least 6 characters long and contain only digits and english alphabet letters');
            } else {
                kinveyController.login(username, password).then(function (res) {
                    kinveyController.saveAuthInSession(res)
                    showInfo('Login successful!')
                    ctx.redirect('#/catalog')
                }).catch(kinveyController.handleError);

            }
        })

        this.get('#/catalog',function (ctx) {
            ctx.noListings = false
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }

            kinveyController.listAllCars().then(function (listings) {
                console.log(listings.length);

                if(listings.length ===0){
                   ctx.noListings = true
                }

                listings.forEach(l =>{
                    l.listingId = l._id
                    if(l.seller === sessionStorage.getItem('username')){
                        l.isAuthor = true
                    }else{
                        l.isAuthor = false
                    }
                })

                ctx.listings = listings;

                ctx.loadPartials({
                    navbar: './templates/common/navbar.hbs',
                    footer: './templates/common/footer.hbs',
                    listing: './templates/details/listing.hbs'
                }).then(function () {
                    this.partial('./templates/allListings.hbs')
                })
            }).catch(kinveyController.handleError)


        })

        this.get('#/logout',function (ctx) {
            kinveyController.logout().then(function (res) {
                sessionStorage.clear()
                showInfo('Logout successful.')
                ctx.redirect('#/login')
            }).catch(kinveyController.handleError)
        })

        this.get('#/create', function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }
            ctx.loadPartials({
                navbar: './templates/common/navbar.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/createListing.hbs')
            })
        })

        this.post('#/create',function (ctx) {
            let brand = (ctx.params.brand);
            let description = (ctx.params.description);
            let fuel = (ctx.params.fuelType);
            let imageUrl = (ctx.params.imageUrl);
            let model = (ctx.params.model);
            let price = (ctx.params.price);
            let seller = sessionStorage.getItem('username');
            let title = (ctx.params.title);
            let year = (ctx.params.year);


            console.log(title);
            if(title.length >= 33){
                showError('Title must be less than 33 characters');
            } else if(description.length < 30 || description.length >= 450){
                showError('Description must be less than 450 characters and at least 30');
            } else if(brand.length >=11){
                showError('Brand must be less than 11 characters');
            } else if(fuel.length >=11){
                showError('Fuel type must be less than 11 characters');
            } else if(model.length >=11 || model.length <4){
                showError('Model must be less than 11 characters and at least 4 characters');
            } else if(year.length >4){
                showError('Year must be only 4 chars long');
            } else if(Number(price) > 1000000){
                showError('The maximum price is 1000000$');
            } else if(!imageUrl.startsWith('http')){
                showError('Link url should always start with “http”.');
            } else if(brand===null || description===null || fuel===null || imageUrl===null ||
                model===null || price===null || title===null || year===null){
                showError('Input fields should not be empty');
            } else {

                kinveyController.createListing(brand, description, fuel, imageUrl, model, price, seller, title, year)
                    .then(function (res) {
                        showInfo('Listing created.')
                        ctx.redirect('#/catalog')
                    }).catch(kinveyController.handleError)
            }
        })

        this.get('#/edit/:listingId',function (ctx) {
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }

            let listingId = ctx.params.listingId;

            kinveyController.getListingDetailsById(listingId).then(function (res) {
                ctx.listing = res

                ctx.loadPartials({
                    navbar: './templates/common/navbar.hbs',
                    footer: './templates/common/footer.hbs'
                }).then(function () {
                    this.partial('./templates/editListing.hbs')
                })
            }).catch(kinveyController.handleError)
        })

        this.post('#/edit',function (ctx) {
            let listingId = ctx.params.carId;
            let brand = (ctx.params.brand);
            let description = (ctx.params.description);
            let fuel = (ctx.params.fuelType);
            let imageUrl = (ctx.params.imageUrl);
            let model = (ctx.params.model);
            let price = (ctx.params.price);
            let seller = sessionStorage.getItem('username');
            let title = (ctx.params.title);
            let year = (ctx.params.year);

            console.log(listingId);

            if(title.length >= 33){
                showError('Title must be less than 33 characters');
            } else if(description.length < 30 || description.length >= 450){
                showError('Description must be less than 450 characters and at least 30');
            } else if(brand.length >=11){
                showError('Brand must be less than 11 characters');
            } else if(fuel.length >=11){
                showError('Fuel type must be less than 11 characters');
            } else if(model.length >=11 || model.length <4){
                showError('Model must be less than 11 characters and at least 4 characters');
            } else if(year.length >4){
                showError('Year must be only 4 chars long');
            } else if(Number(price) > 1000000){
                showError('The maximum price is 1000000$');
            } else if(!imageUrl.startsWith('http')){
                showError('Link url should always start with “http”.');
            } else if(brand===null || description===null || fuel===null || imageUrl===null ||
                model===null || price===null || title===null || year===null){
                showError('Input fields should not be empty');
            } else {
                kinveyController.editCarListing(brand, description, fuel, imageUrl, model, price, seller, title, year, listingId)
                    .then(function (res) {
                        showInfo(`Listing ${title} updated.`)
                        ctx.redirect('#/catalog')
                    }).catch(kinveyController.handleError)
            }
        })

        this.get('#/delete/:listingId',function (ctx) {
            let listingId = ctx.params.listingId;

            kinveyController.deleteCarListing(listingId).then(function (res) {
                showInfo('Listing deleted.')
                ctx.redirect('#/catalog')
            }).catch(kinveyController.handleError)
        })
        
        this.get('#/myListings',function (ctx) {
            ctx.noListings = false
            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }

            kinveyController.getMyCarListings().then(function (listings) {
                if(listings.length ===0){
                    ctx.noListings = true
                }

                listings.forEach(l =>{
                    l.listingId = l._id
                })

                ctx.listings = listings;

                ctx.loadPartials({
                    navbar: './templates/common/navbar.hbs',
                    footer: './templates/common/footer.hbs',
                    myListing: './templates/details/myListing.hbs'
                }).then(function () {
                    this.partial('./templates/myListings.hbs')
                })
            }).catch(kinveyController.handleError)

        })

        this.get('#/details/:listingId',function (ctx) {
            let listingId = ctx.params.listingId;

            ctx.isAuth = auth.isAuth()
            if(auth.isAuth()){
                ctx.username = sessionStorage.getItem('username')
            }

            kinveyController.getListingDetailsById(listingId).then(function (listings) {


                console.log(listings.seller);

                if(listings.seller === sessionStorage.getItem('username')){
                    ctx.isAuthor = true
                }else{
                    ctx.isAuthor = false
                }

                ctx.listing = listings;

                ctx.loadPartials({
                    navbar: './templates/common/navbar.hbs',
                    footer: './templates/common/footer.hbs',
                }).then(function () {
                    this.partial('./templates/listingDetails.hbs')
                })
            }).catch(kinveyController.handleError)
        })
    });

    app.run()

});