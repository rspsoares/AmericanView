using AmericanView.Administrativo.Domain;
using AmericanView.Comum.Databases;
using System;
using System.Collections.Generic;
using Dapper;
using Dapper.Contrib;
using Dapper.Contrib.Extensions;
using System.Text;
using MySql.Data.MySqlClient;
using System.Linq;

namespace AmericanView.Administrativo.Infrastructure.Repositories
{
    public class UnidadeRepository
    {
        string _connstring;

        public UnidadeRepository()
        {
            TipoBanco.GetNomeBancoDados(out _connstring);
        }

        public void AtualizarUnidade(Unidade unidade)
        {
            StringBuilder sb = new StringBuilder();

            using (MySqlConnection cn = new MySqlConnection(_connstring))
            {
                cn.Open();
                cn.Update(unidade);
                cn.Close();
            }
        }

        public List<Unidade> ConsultarUnidade(Unidade unidade)
        {
            List<Unidade> lstUnidades = new List<Unidade>();
            StringBuilder sb = new StringBuilder();

            sb.AppendLine("SELECT * FROM Unidades WHERE 1=1 ");

            if (string.IsNullOrEmpty(unidade.Codigo) == false)
                sb.AppendFormat("AND Codigo = '{0}'", unidade.Codigo);

            if (string.IsNullOrEmpty(unidade.Nome) == false)
                sb.AppendFormat("AND Nome Like '%{0}%' ", unidade.Nome);

            if (string.IsNullOrEmpty(unidade.Endereco) == false)
                sb.AppendFormat("AND Endereco Like '%{0}%' ", unidade.Endereco);

            if (string.IsNullOrEmpty(unidade.Bairro) == false)
                sb.AppendFormat("AND Bairro Like '%{0}%' ", unidade.Bairro);

            if (string.IsNullOrEmpty(unidade.CEP) == false)
                sb.AppendFormat("AND CEP = '{0}'", unidade.CEP);

            if (string.IsNullOrEmpty(unidade.Cidade) == false)
                sb.AppendFormat("AND Cidade Like '%{0}%' ", unidade.Cidade);

            if (string.IsNullOrEmpty(unidade.Estado) == false)
                sb.AppendFormat("AND Estado = '{0}'", unidade.Estado);

            if (string.IsNullOrEmpty(unidade.Telefones) == false)
                sb.AppendFormat("AND Telefones Like '%{0}%' ", unidade.Telefones);

            if (string.IsNullOrEmpty(unidade.Responsavel) == false)
                sb.AppendFormat("AND Responsavel Like '%{0}%' ", unidade.Responsavel);

            if (string.IsNullOrEmpty(unidade.Email) == false)
                sb.AppendFormat("AND Email Like '%{0}%' ", unidade.Email);

            using (MySqlConnection cn = new MySqlConnection(_connstring))
            {
                cn.Open();
                lstUnidades = cn.Query<Unidade>(sb.ToString()).ToList();
                cn.Close();
            }

            return lstUnidades;
        }

        public void DesativarUnidade(int Id)
        {
            string query = string.Empty;

            query = string.Format("UPDATE Unidades SET Ativo = 0 WHERE Id = {0}", Id);

            using (MySqlConnection cn = new MySqlConnection(_connstring))
            {
                cn.Open();
                cn.Execute(query);
                cn.Close();
            }
        }

        public long InserirUnidade(Unidade unidade)
        {            
            long Id = 0;
            
            using (MySqlConnection cn = new MySqlConnection(_connstring))
            {
                cn.Open();
                Id = cn.Insert(unidade);
                cn.Close();
            }

            return Id;
        }
    }
}
