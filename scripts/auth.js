let auth = (function () {
    function isAuth() {
        return sessionStorage.getItem('authToken') !== null
    }

    return {isAuth}
})()