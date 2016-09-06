using AmericanView.Administrativo.Domain;
using AmericanView.Comum.Databases;
using System.Collections.Generic;
using Dapper;
using Dapper.Contrib.Extensions;
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

        public long Inserir(Unidade unidade)
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

        public void Atualizar(Unidade unidade)
        {
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Update(unidade);
                cn.Close();
            }
        }

        public List<Unidade> Consultar(Unidade unidade)
        {
            List<Unidade> lstUnidades = new List<Unidade>();
            string query = string.Empty;

            query = "SELECT * FROM Unidades WHERE Ativo = 1";
            
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                lstUnidades = cn.Query<Unidade>(query).ToList();
                cn.Close();
            }

            return lstUnidades;
        }

        public void Desativar(int Id)
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
    }
}
