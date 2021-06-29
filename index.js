const express = require("express");
const session = require("express-session");
const handlebars = require("express-handlebars");
const handlebars_helper = require("handlebars-helpers")();
const methodOverride = require("method-override");
const flash = require("connect-flash");

const middleware = require("./middleware");
const routeHub = require("./routers/routeHub");

const port = require("./public/config.json").server.port;

const app = express();

/*&==================================================================================================================*
 *& Configurazione Expressjs, handlebars, ecc...
*&=================================================================================================================*/
app.engine(".hbs", handlebars({
   extname: ".hbs",
   handlebars_helper
}));
app.set("view engine", ".hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"));
app.use("/common", express.static(__dirname + "/common"));
app.use("/images", express.static(__dirname + "/public/images"));
app.use("/js", express.static(__dirname + "/views"));
app.use(session({
   cookie: {
      maxAge: 60 * 60 * 1000
   },
   secret: "SarahConnor",
   resave: false,
   saveUninitialized: false
}));
app.use(methodOverride(function (request, response) {
   if(request.body && typeof request.body === "object" && "_method" in request.body) {
      let method = request.body._method;
      delete request.body._method;
      return method;
   }
}));
app.use(flash());

/*&==================================================================================================================*
 *& Questo middleware è usato per passare la sessione alla pagina
 *&=================================================================================================================*/
app.all("*", function(request, response, next) {
   // Rende disponibile la sessione all'interno della pagina per handlebars:
   response.locals.session = request.session;

   // Passa al middleware successivo:
   next();
});

/*&------------------------------------------------------------------------------------------------------------------*
 *& Middlleware necessari per la gestione delle rotte relativa al
 *& Portale dell'Utente
 *&=================================================================================================================*/
app.use("/", middleware.Authentication, routeHub);

/*&==================================================================================================================*
 *& Avvia il server
 *&=================================================================================================================*/
app.listen(port);