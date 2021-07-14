/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
   let profileid = document.querySelector("#profileid");
   let email = document.querySelector("#email");
   let name = document.querySelector("#name");
   let password = document.querySelector("#password");
   let repassword = document.querySelector("#repassword");
   let security = document.querySelector("#security");
   let resecurity = document.querySelector("#resecurity");
   let error = 0;

   // Controlla coerenza dell'indirizzo e-mail:
   if(email.value === "" || !regex.test(email.value)) {
      email.classList.add("is-invalid");
      error++;
   }
   else {
      email.classList.remove("is-invalid");
   }

   // Controlla la presenza del nome utente:
   if(name.value.length === 0) {
      name.classList.add("is-invalid");
      error++;
   }
   else {
      name.classList.remove("is-invalid");
   }

   // Gestisce la password e la frase di sicurezza in base al fatto che stiamo
   // creando o modificando un'utenza:
   if(email.readOnly) {
      if(password.value.length > 0) {
         if(password.value.length < 8) {
            password.classList.add("is-invalid");
            repassword.classList.remove("is-invalid");
            error++;
         }
         else {
            password.classList.remove("is-invalid");
            if(password.value !== repassword.value) {
               repassword.classList.add("is-invalid");
               error++;
            }
            else {
               password.classList.remove("is-invalid");
               repassword.classList.remove("is-invalid");
            }
         }
      }
   }
   else {
      if(password.value.length < 8) {
         password.classList.add("is-invalid");
         repassword.classList.remove("is-invalid");
         error++;
      }
      else {
         password.classList.remove("is-invalid");
         if(password.value !== repassword.value) {
            repassword.classList.add("is-invalid");
            error++;
         }
         else {
            password.classList.remove("is-invalid");
            repassword.classList.remove("is-invalid");
         }
      }
   }

   if(email.readOnly) {
      if(security.value.length > 0) {
         if(security.value.length < 8) {
            security.classList.add("is-invalid");
            resecurity.classList.remove("is-invalid");
            error++;
         }
         else {
            security.classList.remove("is-invalid");
            if(security.value !== resecurity.value) {
               resecurity.classList.add("is-invalid");
               error++;
            }
            else {
               security.classList.remove("is-invalid");
               resecurity.classList.remove("is-invalid");
            }
         }
      }
   }
   else {
      if(security.value.length < 8) {
         security.classList.add("is-invalid");
         resecurity.classList.remove("is-invalid");
         error++;
      }
      else {
         security.classList.remove("is-invalid");
         if(security.value !== resecurity.value) {
            resecurity.classList.add("is-invalid");
            error++;
         }
         else {
            security.classList.remove("is-invalid");
            resecurity.classList.remove("is-invalid");
         }
      }
   }

   // Procede al POST:
   if(!error) {
      document.querySelector("#_new").value = !email.readOnly;
      document.querySelector("#_profileid").value = document.querySelector("#profileid").value;
      document.querySelector("#_locked").value = document.querySelector("#locked").value;
      document.querySelector("#submit").submit();
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#remove").addEventListener("click", (event) => {
   // Permette l'eliminazione di un'utenza:
   document.querySelector("#_method").value = "DELETE";
   document.querySelector("#submit").submit();
});