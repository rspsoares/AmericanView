using Dapper.Contrib.Extensions;

namespace AmericanView.Administrativo.Domain
{
    [Table("Unidades")]
    public class Unidade
    {
        public Unidade()
        {
            Ativo = true;
        }

        [Key]
        public long Id { get; set; }
        public string Codigo { get; set; }
        public string Nome { get; set; }
        public string Endereco { get; set; }
        public string Bairro { get; set; }
        public string CEP { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }
        public string Telefones { get; set; }
        public string Responsavel { get; set; }
        public string Email { get; set; }
        public bool Ativo { get; set; }
    }
}
