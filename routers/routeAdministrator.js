const express = require("express");
const crypto = require("bcrypt");
const Base = require("../libraries/Base");
const Application = require("../libraries/Application");
const Profile = require("../libraries/Profile");
const User = require("../libraries/User");

const config = require("../public/config.json").database;

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/", async(request, response) => {
   // Inizializza proprietà locali:
   let data = [];

   // Recupera le informazioni da visualizzare nella pagina:
   data = await getTabData(request);

   // Render della pagina di amministrazione:
   response.render("administrator/entry", {
      "title": "Amministrazione",
      "id": request.session.app,
      "data": data
   });
});
router.post("/", async(request, response) => {
   // Inizializza proprietà locali:
   let data = [];

   // Recupera le informazioni da visualizzare nella pagina:
   delete request.session.app;
   data = await getTabData(request);

   // Render della pagina di amministrazione:
   response.render("administrator/entry", {
      "title": "Amministrazione",
      "id": request.session.app,
      "data": data
   });
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/application_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let application = undefined;
   let documents = [];
   let data = {};

   // Legga applicazione se si tratta di una modifica:
   try {
      if(request.query.id !== undefined) {
         application = new Application();
         await application.open(config.dbname, config.address, config.port);
         documents = await application.load(request.query.id);
         data = {
            "_id": application.name,
            "title": application.title,
            "description": application.description,
            "sortid": application.sortid,
            "locked": application.locked
         };
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      if(request.query.id !== undefined) {
         await application.close();
         application = undefined;
      }
   }

   // Render della pagina di modifica di un'applicazione:
   response.render("administrator/application_edit", {
      "title": "Amministrazione - Applicazione",
      "data": data,
      "alert-danger": request.flash("alert-danger")
   });
});
router.post("/application_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let application = undefined;
   let documents = [];
   let data = {};
   let new_app = false;

   // Se non è presente un parametro nell'url significa che si tratta di una nuova applicazione:
   new_app = request.body._new === "true" ? true : false;

   // Procede con l'aggiornamento o creazione dell'applicazione:
   try {
      application = new Application();
      await application.open(config.dbname, config.address, config.port);
      if(new_app) {
         documents = await application.find({ "_id": request.body._id });
         if(documents.length !== 0) {
            data = documents[0];
            data._id = "";
            request.flash("alert-danger", "L'applicazione è già presente");
            response.render("administrator/application_edit", {
               "title": "Amministrazione - Applicazione",
               "data": data,
               "alert-danger": request.flash("alert-danger")
            });
         }
         else {
            await application.new(request.body._id);
            application.title = request.body.title;
            application.description = request.body.description;
            application.sortid = request.body.sortid.length === 0 ? 0 : request.body.sortid;
            application.locked = request.body._locked === "1" ? false : true;
            await application.save();
         }
      }
      else {
         await application.load(request.body._id);
         application.title = request.body.title;
         application.description = request.body.description;
         application.sortid = request.body.sortid.length === 0 ? 0 : request.body.sortid;
         application.locked = request.body._locked === "1" ? false : true;
         await application.save();
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await application.close();
      application = undefined;
   }

   // Riporta sulla pagina della applicazioni:
   response.redirect("/administrator");
});
router.delete("/application_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let application = undefined;
   let documents = [];
   let data = {};
   let _counter = "";

   // La cancellazione avviene premendo due volte il pulsante di "cancellazione". Questo doppio click
   // è gestito dal campo "_counter":
   try {
      application = new Application();
      await application.open(config.dbname, config.address, config.port);
      await application.load(request.body._id);
      data = {
         "_id": application.name,
         "title": application.title,
         "description": application.description,
         "sortid": application.sortid,
         "locked": application.locked
      };
      if(request.body._counter === "1") {
         await application.remove(true);
         response.redirect("/administrator");
      }
      else {
         _counter = "1";
         request.flash("alert-warning", "Per confermare la cancellazione, premi nuovamente");
         response.render("administrator/application_edit", {
            "title": "Amministrazione - Applicazione",
            "data": data,
            "_counter": _counter,
            "alert-warning": request.flash("alert-warning")
         });
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await application.close();
      application = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/profile_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let profile = undefined;
   let documents = [];
   let data = {};

   // Legga applicazione se si tratta di una modifica:
   try {
      if(request.query.id !== undefined) {
         profile = new Profile();
         await profile.open(config.dbname, config.address, config.port);
         documents = await profile.load(request.query.id);
         data = {
            "_id": profile.name,
            "description": profile.description,
            "admin": profile.admin,
            "locked": profile.locked
         };
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      if(request.query.id !== undefined) {
         await profile.close();
         profile = undefined;
      }
   }

   // Render della pagina di modifica di un profilo:
   response.render("administrator/profile_edit", {
      "title": "Amministrazione - Profilo",
      "data": data,
      "alert-danger": request.flash("alert-danger")
   });
});
router.post("/profile_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let profile = undefined;
   let documents = [];
   let data = {};
   let new_app = false;

   // Se non è presente un parametro nell'url significa che si tratta di un nuovo profilo:
   new_app = request.body._new === "true" ? true : false;

   // Procede con l'aggiornamento o creazione del profilo:
   try {
      profile = new Profile();
      await profile.open(config.dbname, config.address, config.port);
      if(new_app) {
         documents = await profile.find({ "_id": request.body._id });
         if(documents.length !== 0) {
            data = documents[0];
            data._id = "";
            request.flash("alert-danger", "Il profilo è già presente");
            response.render("administrator/profile_edit", {
               "title": "Amministrazione - Profilo",
               "data": data,
               "alert-danger": request.flash("alert-danger")
            });
         }
         else {
            await profile.new(request.body._id);
            profile.description = request.body.description;
            profile.admin = request.body._admin === "1" ? false : true;
            profile.locked = request.body._locked === "1" ? false : true;
            await profile.save();
         }
      }
      else {
         await profile.load(request.body._id);
         profile.description = request.body.description;
         profile.admin = request.body._admin === "1" ? false : true;
         profile.locked = request.body._locked === "1" ? false : true;
         await profile.save();
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await profile.close();
      profile = undefined;
   }

   // Riporta sulla pagina dei profili:
   response.redirect("/administrator");
});
router.delete("/profile_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let profile = undefined;
   let documents = [];
   let data = {};
   let _counter = "";

   // La cancellazione avviene premendo due volte il pulsante di "cancellazione". Questo doppio click
   // è gestito dal campo "_counter":
   try {
      profile = new Profile();
      await profile.open(config.dbname, config.address, config.port);
      await profile.load(request.body._id);
      data = {
         "_id": profile.name,
         "description": profile.description,
         "admin": profile.admin,
         "locked": profile.locked
      };
      if(request.body._counter === "1") {
         await profile.remove(true);
         response.redirect("/administrator");
      }
      else {
         _counter = "1";
         request.flash("alert-warning", "Per confermare la cancellazione, premi nuovamente");
         response.render("administrator/profile_edit", {
            "title": "Amministrazione - Profilo",
            "data": data,
            "_counter": _counter,
            "alert-warning": request.flash("alert-warning")
         });
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await profile.close();
      profile = undefined;
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/user_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let profile = undefined;
   let user = undefined;
   let documents = [];
   let profile_data = [];
   let data = {};

   // Prepara valori da passare alla pagina:
   try {

      // Lista dei profili:
      profile = new Profile();
      await profile.open(config.dbname, config.address, config.port);
      documents = await profile.find();
      documents.forEach(record => {
         profile_data.push({
            "id": record._id,
            "description": record.description
         });
      });

      // Se si tratta di una modifica, dati dell'utente:
      if(request.query.id !== undefined) {
         user = new User(profile.database);
         await user.load(request.query.id);
         data = {
            "email": user.email,
            "name": user.name,
            "locked": user.locked,
            "profileid": user.profile
         };
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await profile.close();
      profile = undefined;
      user = undefined;
   }

   // Render della pagina di modifica di un utente:
   response.render("administrator/user_edit", {
      "title": "Amministrazione - Utente",
      "profile": profile_data,
      "data": data,
      "alert-danger": request.flash("alert-danger")
   });
});
router.post("/user_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;
   let documents = [];
   let data = {};
   let new_user = false;

   // Se non è presente un parametro nell'url significa che si tratta di una nuova utenza:
   new_user = request.body._new === "true" ? true : false;

   // Procede con l'aggiornamento o creazione dell'utenza:
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      if(new_user) {
         documents = await user.find({ "_id": request.body.email });
         if(documents.length !== 0) {
            data = documents[0];
            data._id = "";
            request.flash("alert-danger", "L'indirizzo e-mail è già presente");
            response.render("administrator/user_edit", {
               "title": "Amministrazione - Utente",
               "data": data,
               "alert-danger": request.flash("alert-danger")
            });
         }
         else {
            await user.new(request.body.email);
            user.name = request.body.name;
            user.profile = request.body._profileid;
            user.locked = request.body._locked === "1" ? false : true;
            if(request.body.password.length > 0)
               user.password = crypto.hashSync(request.body.password, 12);
            if(request.body.security.length > 0)
               user.security = crypto.hashSync(request.body.security, 12);
            await user.save();
         }
      }
      else {
         await user.load(request.body.email);
         user.name = request.body.name;
         user.profile = request.body._profileid;
         user.locked = request.body._locked === "1" ? false : true;
         if(request.body.password.length > 0)
            user.password = crypto.hashSync(request.body.password, 12);
         if(request.body.security.length > 0)
            user.security = crypto.hashSync(request.body.security, 12);
         await user.save();
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }

   // Riporta sulla pagina dei profili:
   response.redirect("/administrator");
});
router.delete("/user_edit", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;
   let documents = [];
   let data = {};
   let _counter = "";

   // La cancellazione avviene premendo due volte il pulsante di "cancellazione". Questo doppio click
   // è gestito dal campo "_counter":
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.body.email);
      data = {
         "email": user.email,
         "name": user.name,
         "locked": user.locked,
         "profileid": user.profile
      };
      if(request.body._counter === "1") {
         await user.remove(true);
         response.redirect("/administrator");
      }
      else {
         _counter = "1";
         request.flash("alert-warning", "Per confermare la cancellazione, premi nuovamente");
         response.render("administrator/user_edit", {
            "title": "Amministrazione - Utenza",
            "data": data,
            "_counter": _counter,
            "alert-warning": request.flash("alert-warning")
         });
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
async function getTabData(request) {
   // Inizializza proprietà locali:
   let base = undefined;
   let documents = [];
   let data = [];

   // Nella sessione è presente il tab di origine:
   if(request.session.app === undefined && request.body._id === undefined)
      request.session.app = 1;
   else if(request.session.app === undefined)
      request.session.app = parseInt(request.body._id);

   // Oggetto per il recupero dei dato dalla base dati:
   try {
      base = new Base();
      await base.open(config.dbname, config.address, config.port);

      // Determina quale visualizzazione:
      switch(request.session.app) {
         case 1:
            documents = await base._find("applications", { "type": "application" });
            documents.forEach(record => {
               data.push({
                  "_id": record._id,
                  "title": record.title,
                  "description": record.description,
                  "sortid": record.sortid,
                  "locked": record.locked,
                  "changed_at": record.changed_at !== undefined ? record.changed_at.toLocaleString() : record.created_at.toLocaleString()
               });
            });
            break;

         case 2:
            documents = await base._find("profiles", { "type": "profile" })
            documents.forEach(record => {
               data.push({
                  "_id": record._id,
                  "description": record.description,
                  "locked": record.locked,
                  "changed_at": record.changed_at !== undefined ? record.changed_at.toLocaleString() : record.created_at.toLocaleString()
               });
            });
            break;

         case 3:
            documents = await base._find("users", { "type": "user" })
            documents.forEach(record => {
               data.push({
                  "_id": record._id,
                  "name": record.name,
                  "profile": record.profile,
                  "locked": record.locked,
                  "changed_at": record.changed_at !== undefined ? record.changed_at.toLocaleString() : record.created_at.toLocaleString()
               });
            });
            break;

         case 4:
            break;
      }
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await base.close();
      base = undefined;
   }

   // Restituisce i dati da passare alla pagina:
   return data;
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;