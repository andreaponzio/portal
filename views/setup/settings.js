/*&==================================================================================================================*
 *&
**&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Dichiarazione riferimenti:
   let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
   let email = document.querySelector("#email");
   let name = document.querySelector("#name");
   let password = document.querySelector("#password");
   let repassword = document.querySelector("#repassword");
   let security = document.querySelector("#security");
   let resecurity = document.querySelector("#resecurity");
   let error = 0;

   // Controlla la presenza del nome utente:
   if(name.value.length === 0) {
      name.classList.add("is-invalid");
      error++;
   }
   else {
      name.classList.remove("is-invalid");
   }

   // Controlla la presenza della password:
   if(password.value !== "") {
      if(password.value.length < 8) {
         password.classList.add("is-invalid");
         repassword.classList.remove("is-invalid");
         error++;
      }
      else {
         password.classList.remove("is-invalid");

         // Controlla la password e la sua ripetizione:
         if(password.value !== repassword.value) {
            repassword.classList.add("is-invalid");
            error++;
         }
         else {
            repassword.classList.remove("is-invalid");
         }
      }
   }

   // Controlla la presenza della frase di sicurezza:
   if(security.value !== "") {
      if(security.value.length < 10) {
         security.classList.add("is-invalid");
         resecurity.classList.remove("is-invalid");
         error++;
      }
      else {
         security.classList.remove("is-invalid");

         // Controlla la password e la sua ripetizione:
         if(security.value !== resecurity.value) {
            resecurity.classList.add("is-invalid");
            error++;
         }
         else {
            resecurity.classList.remove("is-invalid");
         }
      }
   }

   // Effettua submit:
   if(!error)
      document.querySelector("#submit").submit();
});