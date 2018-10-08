const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_SyqQWh6rQ'
const APP_SECRET = '95366cce0bcd44a087b9285c3f01d6a8'
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}

let kinveyController = (function () {

    function register(username,password) {
        return $.ajax({
            method: 'POST',
            url: BASE_URL + 'user/' + APP_KEY + '/',
            headers: AUTH_HEADERS,
            data: {username,password}
        })
    }

    function login(username,password) {
        return $.ajax({
            method: 'POST',
            url: BASE_URL + 'user/' + APP_KEY + '/login',
            headers: AUTH_HEADERS,
            data: {username,password}
        })
    }

    function logout() {
        return $.ajax({
            method: 'POST',
            url: BASE_URL + 'user/' + APP_KEY + '/_logout',
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')}
        })
    }

    function listAllCars() {
        return $.ajax({
            method: 'GET',
            url: BASE_URL + 'appdata/' + APP_KEY + '/cars?query={}&sort={"_kmd.ect": -1}',
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')}
        })
    }
    
    function createListing(brand,description,fuel,imageUrl,model,price,seller,title,year) {
        return $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/cars',
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')},
            data: {brand,description,fuel,imageUrl,model,price,seller,title,year}
        })
    }

    function editCarListing(brand,description,fuel,imageUrl,model,price,seller,title,year,listingId) {
        return $.ajax({
            method: 'PUT',
            url: BASE_URL + 'appdata/' + APP_KEY + `/cars/${listingId}`,
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')},
            data: {brand,description,fuel,imageUrl,model,price,seller,title,year}
        })
    }

    function getListingDetailsById(listingId) {
        return $.ajax({
            method: 'GET',
            url: BASE_URL + 'appdata/' + APP_KEY + `/cars/${listingId}`,
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')}
        })
    }

    function deleteCarListing(listingId) {
        return $.ajax({
            method: 'DELETE',
            url: BASE_URL + 'appdata/' + APP_KEY + `/cars/${listingId}`,
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')}
        })
    }

    function getMyCarListings() {
        return $.ajax({
            method: 'GET',
            url: BASE_URL + 'appdata/' + APP_KEY + `/cars?query={"seller":"${sessionStorage.getItem('username')}"}&sort={"_kmd.ect": -1}`,
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')}
        })
    }

    function saveAuthInSession(userInfo) {
        sessionStorage.setItem('authToken', userInfo._kmd.authtoken)
        sessionStorage.setItem('id', userInfo._id)
        sessionStorage.setItem('username', userInfo.username)
    }

    function handleError(err) {
        showError(err.message);
    }

    return {register,login,handleError,saveAuthInSession,logout,listAllCars,createListing,editCarListing,getListingDetailsById,deleteCarListing,getMyCarListings}
})()