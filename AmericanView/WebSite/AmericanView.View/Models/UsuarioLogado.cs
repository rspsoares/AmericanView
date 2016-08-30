using System;
using System.Collections.Generic;

namespace AmericanView.View.Models
{
    public class UsuarioLogado
    {
        public int idUsuario { get; set; }
        public string Login { get; set; }
        public string Nome { get; set; }
        public Guid uqUsuario { get; set; }
        public string Email { get; set; }
        public TipoUsuario Origem { get; set; }
        public int Inscricao { get; set; }
        public List<string> lstCNPJPermitidos { get; set; }
        public List<string> lstCNPJPermitidosCombo { get; set; }
    }

    public enum TipoUsuario
    {
        Administrador = 1,
        Suporte = 2,
        Usuario = 3
    }
}
