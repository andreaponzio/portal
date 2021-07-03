const express = require("express");
const Chat = require("../libraries/Chat");
const User = require("../libraries/User");

const config = require("../public/config.json").database;

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = undefined;
   let documents = [];
   let data = [];

   // Prepara elenco delle chat da visualizzare:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      documents = await chat.find({ "type": "chat" });

      // Chat usata per permetterne la creazione di una nuova:
      data.push({
         "id": "new",
         "title": "Nuova chat",
         "body": "Permette la creazione di una nuova chat",
         "locked": false,
         "external": false,
         "new": true
      });

      // Chat disponibili:
      documents.forEach(record => {
            data.push({
               "id": record._id,
               "title": record.title.substr(0, 15),
               "body": record.messages[0].content.substr(0, 59),
               "locked": record.locked,
               "external": record.external,
               "new": false
            });
         });
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Render della pagina della chat:
   response.render("chat/entry", {
      "title": "Comunicazioni",
      "data": data,
      "alert-success": request.flash("alert-success")
   });
});
router.get("/new", async(request, response) => {
   // Inizializza proprietà locali:
   let user = undefined;
   let documents = [];
   let address = [];

   // Legge gli indirizzi e-mail in modo da popolare la combo:
   try {
      user = new User();
      await user.open(config.dbname, config.address, config.port);
      if(request.session.userdata === undefined)
         documents = await user.find({ "type": "user", "locked": false });
      else
         documents = await user.find({
            "type": "user",
            "locked": false,
            "_id": {
               $ne: request.session.userdata.email
            }
         });

      // Prepara array degli indirizzi e-mail disponibili:
      documents.forEach(record => {
         address.push({ "email": record._id });
      });
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }

   // Render della pagina per l'inserimento di una nuova chat:
   response.render("chat/new", {
      "title": "Nuova comunicazione",
      "address": address
   });
});
router.post("/new", async(request, response) => {
   // Inizializza proprietò locali:
   let chat = undefined;

   // Permette d'inserire una nuova chat:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      chat.new(request.body.title);
      chat.addOwner(request.session.userdata.email);
      chat.addOwner(request.body.email);
      chat.add(request.session.userdata.email, request.body.data);
      await chat.save();
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Redirect della pagina della chat:
   response.redirect("/chat");
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.post("/fastReply", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = undefined;
   let id = undefined;

   // Determina l'identificativo della chat sulla quale aggiungere una risposta:
   id = parseInt(request.body._id.substr(1));

   // Aggiunge risposta:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      await chat.load(id);
      chat.add(request.session.userdata.email, request.body.data);
      await chat.save();
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Redirect della pagina della chat:
   request.flash("alert-success", "Risposta inviata");
   response.redirect("/chat");
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/open", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = undefined;
   let messages = [];
   let data = {};

   // Visualizza chat:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      await chat.load(parseInt(request.query.id));

      // Sistema in un formato più compatto la data dei messaggi:
      chat.messages.forEach(msg => {
         messages.push({
            "owner": msg.owner,
            "content": msg.content,
            "created_at": msg.created_at.toLocaleString()
         });
      });

      // Prepara chat da visualizzare:
      data = {
         "id": chat.id,
         "title": `Chat - ${chat.title}`,
         "created_at": chat.created_at.toLocaleString(),
         "changed_at": chat.changed_at.toLocaleString(),
         "created_by": chat.created_by,
         "external": chat.external,
         "locked": chat.locked,
         "messages": messages
      };
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat = undefined;
   }

   // Render della pagina del contenuto chat:
   response.render("chat/messages", {
      "title": data.title,
      "data": data
   });
});
router.post("/reply", async(request, response) => {
   // Inizializza proprietà locali:
   let chat = undefined;

   // Aggiunge risposta:
   try {
      chat = new Chat();
      await chat.open(config.dbname, config.address, config.port);
      await chat.load(parseInt(request.body._id));
      chat.add(request.session.userdata.email, request.body.data);
      await chat.save();
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await chat.close();
      chat =undefined;
   }

   // Reinderizza sulla pagina principale della chat:
   response.redirect("/chat");
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/lock", async(request, response) => {

});
router.get("/unlock", async(request, response) => {

});

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;