using System.ComponentModel.DataAnnotations;

namespace AmericanView.View.Models
{
    public class PerfilPermissao
    {
        [Display(Name = "Perfil")]
        public string Perfil { get; set; }

        public int Identificador { get; set; }
    }
}