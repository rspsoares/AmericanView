namespace Keeptrue.Conciliador.View.Models
{
    using System.ComponentModel.DataAnnotations;
    public class EntradaModel
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "É necessário que o Login seja informado.")]
        [Display(Name = "Usuário")]
        public string Username { get; set; }
        [Required(AllowEmptyStrings = false, ErrorMessage = "Uma senha válida é necessária.")]
        [DataType(DataType.Password)]
        [Display(Name = "Senha")]
        public string Password { get; set; }

        [Display(Name = "Lembre-se de mim")]
        public bool RememberMe { get; set; }

        [ScaffoldColumn(false)]
        public string ReturnUrl { get; set; } 
    }
}