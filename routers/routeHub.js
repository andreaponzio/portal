const express = require("express");
const crypto = require("bcrypt");
const User = require("../libraries/User");
const Profile = require("../libraries/Profile");
const Chat = require("../libraries/Chat");

const config = require("../public/config.json").database;

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/", async(request, response) => {
   // Inizializza proprietà locali:
   let profile = undefined;
   let apps_filter = [];
   let apps = [];

   // Prepara elenco delle applicazioni associate al profilo:
   try {
      profile = new Profile();
      await profile.open(config.dbname, config.address, config.port);
      await profile.load(request.session.userdata.profile);
      profile.applications.forEach(app => {
         apps_filter.push(app.name);
      });
      apps = await profile._find(
         "applications",
         { "_id": { "$in": apps_filter } },
         { "sortid": 1 });
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await profile.close();
      profile = undefined;
   }

   // Pulisce alcuni elementi della sessione:
   delete request.session.app;

   // Render della pagina dell'HUB:
   response.render("hub/entry", {
      "title": "Il Portale dell'Utente",
      "apps": apps,
      "alert-success": request.flash("alert-success"),
      "alert-warning": request.flash("alert-warning"),
      "alert-danger": request.flash("alert-danger")
   });
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.post("/login", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;
   let profile = undefined;
   let sessionid = 0;

   // Verifica che la password inserita sia corretta, e se tutto corrisponde imposta sessione di autenticazione:
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.body.email);
      if(crypto.compareSync(request.body.password, user.password)) {

         // Genera id di sessione:
         sessionid = await user._getIntervalNextNumber("trace", "session-counter");

         // Valorizza dati utente nella sessione:
         profile = new Profile(user.database);
         await profile.load(user.profile);
         request.session.userdata = {
            "userid": user.id,
            "email": user.email,
            "username": user.name,
            "profile": user.profile,
            "admin": profile.admin,
            "sessionid": sessionid
         };

         // Determina quanti messaggi sono ancora da leggere:
         request.session.userdata.unread = await user._count("chats", { "notif": request.session.userdata.email });

         // Scrive sessione e render della pagina principale dell'HUB:
         await user._openSession(sessionid, user.id);
         response.redirect("/");
      }
      else {
         request.flash("alert-danger", "Impossibile autenticare");
         response.redirect("/");
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      profile = undefined;
      user =undefined;
   }
});
router.get("/logoff", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();

   // Chiude la connessione:
   try {
      await user.open(config.dbname, config.address, config.port);
      await user._closeSession(request.session.userdata.sessionid);
      delete request.session.userdata;
      response.redirect("/");
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/registration", async(request, response) => {
   // Render della pagina di registrazione:
   response.render("hub/registration", {
      "title": "Registrazione Utente",
      "emailfound": request.flash("emailfound")
   });
});
router.post("/registration", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();
   let documents = [];

   try {
      // Verifica che l'indirizzo e-mail non sia già registrato:
      await user.open(config.dbname, config.address, config.port);
      documents = await user.find({ "_id": request.body.email });
      if(documents.length !== 0) {
         request.flash("emailfound", "L'indirizzo e-mail è già registrato");
         response.redirect("/registration");
      }

      // Nuova registrazione:
      else {
         await user.new(request.body.email);
         user.name = request.body.name;
         user.password = crypto.hashSync(request.body.password, 12);
         user.security = crypto.hashSync(request.body.security, 12);
         user.profile = "user_not_completed";
         await user.save();

         // Reinderizza sulla pagina principale dell'HUB:
         request.flash("alert-success", "Registrazione avvenuta correttamente");
         response.redirect("/");
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/access-problem", async(request, response) => {
   // Render della pagina per la risoluzione di problemi di autenticazione:
   response.render("hub/access-problem", {
      "title": "Problemi di Accesso",
      "alert-warning": request.flash("alert-warning"),
      "alert-danger": request.flash("alert-danger")
   });
});
router.post("/access-problem", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();

   // Permette di impostare la password di default:
   try {
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.body.email);

      // Verifica la frase di sicurezza e se verificata imposta password di default:
      if(crypto.compareSync(request.body.security, user.security)) {
         user.password = crypto.hashSync("Init1234", 12);
         await user.save();
         request.flash("alert-success", "Nuova password: Init1234. Ricordati di cambiarla!");
         response.redirect("/");
      }
      else {
         request.flash("alert-danger", "Impossibile completare la richiesta");
         response.redirect("/access-problem");
      }
   }
   catch(ex) {
      request.flash("alert-danger", "Impossibile completare la richiesta");
      response.redirect("/access-problem");
   }
   finally {
      await user.close();
      user = undefined;
   }
});
router.delete("/access-problem", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();

   // Permette di impostare la password di default:
   try {
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.body.email);

      // Verifica la frase di sicurezza e se verificata blocca la registrazione:
      if(crypto.compareSync(request.body.security, user.security)) {
         user.locked = true;
         await user.save();
         request.flash("alert-warning", "Registrazione disattivata. Contattare l'amministratore per riattvarla");
         response.redirect("/");
      }
   }
   catch(ex) {
      request.flash("alert-danger", "Impossibile completare la richiesta");
      response.redirect("/access-problem");
   }
   finally {
      await user.close();
      user = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/communic-external", async(request, response) => {
   // Render della pagina per l'invio di una comunicazione all'amministratore:
   response.render("hub/communic-external", { "title": "Comunicazione Utente" });
});
router.post("/communic-external", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = new Chat();

   // Permette di inviare una comunicazione all'amministratore:
   try {
      await chat.open(config.dbname, config.address, config.port);
      chat.new(request.body.data.substr(0, 15));
      chat.addOwner(request.body.email);
      chat.addOwner("admin@localhost");
      chat.add(request.body.email, request.body.data);
      chat.external = true;
      await chat.save();

      request.flash("alert-success", `Messaggio inviato (#${chat.id})`);
      response.redirect("/");
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/user_not_completed", async(request, response) => {
   // Render della pagina dell'HUB:
   response.render("hub/user_not_completed", {
      "title": "Completa la registrazione"
   });
});
router.post("/user_not_completed", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;

   // In base alla scelta dell'utente, assegna il profilo:
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.session.userdata.email);
      switch(request.body.who) {
         case "1":
            user.profile = "user_not_completed";
            break;

         case "2":
            user.profile = "user_not_completed";
            break;

         case "3":
            user.profile = "administrator";
            break;
      }
      await user.save();
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }

   // L'utente deve rifare il login:
   response.redirect("/logoff");
});

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;