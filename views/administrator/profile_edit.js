/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let id = document.querySelector("#_id");
   let id_feedback = document.querySelector("#_id_feedback");
   let description = document.querySelector("#description");
   let error = 0;

   // Controlla l'esistenza di un identificativo:
   if(id.value === "") {
      id_feedback.textContent = "E' necessario inserire un identificativo per il profilo";
      id.classList.add("is-invalid");
      error++;
   }
   else
      id.classList.remove("is-invalid");

   // Verifica la presenza di una descrizione:
   if(description.value.length === 0) {
      description.classList.add("is-invalid");
      error++;
   }
   else
      description.classList.remove("is-invalid");

   // Procede al POST:
   if(!error) {
      document.querySelector("#_new").value = !id.readOnly;
      document.querySelector("#_admin").value = document.querySelector("#admin").value;
      document.querySelector("#_locked").value = document.querySelector("#locked").value;
      document.querySelector("#submit").submit();
   }
});

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#remove").addEventListener("click", (event) => {
   // Permette l'eliminazione di un profilo:
   document.querySelector("#_method").value = "DELETE";
   document.querySelector("#submit").submit();
});