using Dapper.Contrib.Extensions;
using System;
using System.Collections.Generic;

namespace AmericanView.Administrativo.Domain
{
    [Table("Funcionarios")]
    public class Funcionario
    {
        public Funcionario()
        {
            Ativo = true;
            DataDemissao = null;
            lstAtrasos = new List<FuncionarioAtrasos>();
        }

        [Key]
        public long Id { get; set; }
        public long IdUnidade { get; set; }
        public string Nome { get; set; }
        public string RG { get; set; }
        public string CPF { get; set; }
        public string Endereco { get; set; }
        public string Bairro { get; set; }
        public string CEP { get; set; }
        public string Cidade { get; set; }
        public string Estado { get; set; }
        public string Telefones { get; set; }
        public string Email { get; set; }
        public bool utilizaVT { get; set; }
        public DateTime DataAdmissao { get; set; }
        public DateTime? DataDemissao { get; set; }
        public bool Ativo { get; set; }
        [Write(false)]
        public List<FuncionarioAtrasos> lstAtrasos { get; set; }
    }

    [Table("FuncionariosAtrasos")]
    public class FuncionarioAtrasos
    {
        [Key]
        public long Id { get; set; }
        public long IdFuncionario { get; set; }
        public DateTime Atraso { get; set; }
        public byte[] Atestado { get; set; }
    }
}
