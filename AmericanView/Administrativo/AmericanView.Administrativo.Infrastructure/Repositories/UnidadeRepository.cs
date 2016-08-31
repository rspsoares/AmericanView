using AmericanView.Administrativo.Domain;
using AmericanView.Comum.Databases;
using System.Collections.Generic;
using Dapper;
using Dapper.Contrib.Extensions;
using System.Text;
using System.Linq;
using System.Data.SqlClient;

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

            using (SqlConnection cn = new SqlConnection(_connstring))
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

            sb.AppendLine("SELECT * FROM Unidades WHERE Ativo = 1");
            
            using (SqlConnection cn = new SqlConnection(_connstring))
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

            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Execute(query);
                cn.Close();
            }
        }

        public long InserirUnidade(Unidade unidade)
        {            
            long Id = 0;
            
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                Id = cn.Insert(unidade);
                cn.Close();
            }

            return Id;
        }
    }
}
