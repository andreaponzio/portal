const express = require("express");
const crypto = require("bcrypt");
const User = require("../libraries/User");
const Chat = require("../libraries/Chat");

const config = require("../public/config.json");

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/", async(request, response) => {
   // Render della pagina dell'HUB:
   response.render("hub/entry", {
      "title": "Il Portale dell'Utente",
      "alert-success": request.flash("alert-success"),
      "alert-warning": request.flash("alert-warning"),
      "alert-danger": request.flash("alert-danger")
   });
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
      await user.open(config.database.dbname, config.database.address, config.database.port);
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
      await user.open(config.database.dbname, config.database.address, config.database.port);
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
   }
});
router.delete("/access-problem", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();

   // Permette di impostare la password di default:
   try {
      await user.open(config.database.dbname, config.database.address, config.database.port);
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
      await chat.open(config.database.dbname, config.database.address, config.database.port);
      chat.new(request.body.data.substr(1, 20));
      chat.addOwner(request.body.email);
      chat.addOwner("admin@localhost");
      chat.add(request.body.email, request.body.data);
      await chat.save();

      request.flash("alert-success", `Messaggio inviato (#${chat.id})`);
      response.redirect("/");
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
   }
});

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;