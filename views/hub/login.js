/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let email = document.querySelector("#email");
   let password = document.querySelector("#password");
   let error = 0;

   // Controlla coerenza dell'indirizzo e-mail:
   if(email.value === "") {
      email.classList.add("is-invalid");
      error++;
   }
   else {
      email.classList.remove("is-invalid");
   }

   // Controlla la presenza della password:
   if(password.value.length === 0) {
      password.classList.add("is-invalid");
      error++;
   }
   else
      password.classList.remove("is-invalid");

   // Effettua submit:
   if(!error)
      document.querySelector("#submit").submit();
});