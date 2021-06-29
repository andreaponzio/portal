/**
 * Permette di effettuare verifiche di protezione sulle rotte.
 *
 * @param request
 * @param response
 * @param next
 */
Authentication = (request, response, next) => {
   // URL esclusi dal controllo di autenticazione avvenuta:
   if(request.originalUrl === "/registration" ||
      request.originalUrl === "/access-problem" ||
      request.originalUrl === "/communic-external" ||
      request.originalUrl === "/login")
      next();

   // Prosegue solo se l'utente ha eseguito l'autenticazione:
   else if(request.session.userdata === undefined)
      response.render("hub/login", {
         "title": "Autenticazione",
         "alert-success": request.flash("alert-success"),
         "alert-warning": request.flash("alert-warning"),
         "alert-danger": request.flash("alert-danger")
      });
   else
      next();
}

/**
 * Esporta modulo.
 */
module.exports = {
   Authentication
}