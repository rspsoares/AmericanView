using AmericanView.Administrativo.Domain;
using AmericanView.Comum.Databases;
using Dapper;
using Dapper.Contrib.Extensions;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace AmericanView.Administrativo.Infrastructure.Repositories
{
    public class FuncionarioRepository
    {
        string _connstring;

        public FuncionarioRepository()
        {
            TipoBanco.GetNomeBancoDados(out _connstring);
        }

        public long Inserir(Funcionario funcionario)
        {
            long Id = 0;

            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                Id = cn.Insert(funcionario);
                cn.Close();
            }

            return Id;
        }

        public void Atualizar(Funcionario funcionario)
        {
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Update(funcionario);
                cn.Close();
            }
        }

        public List<Funcionario> Consultar(Funcionario funcionario)
        {
            List<Funcionario> lstFuncionarios = new List<Funcionario>();
            string queryFuncionario = string.Empty;
            string queryAtrasos = string.Empty;

            queryFuncionario = string.Format("SELECT * FROM Funcionarios WHERE Ativo = 1 AND idUnidade = {0}", funcionario.IdUnidade);

            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();

                lstFuncionarios = cn.Query<Funcionario>(queryFuncionario).ToList();

                foreach (Funcionario func in lstFuncionarios)
                {
                    queryAtrasos = string.Format("SELECT * FROM FuncionariosAtrasos WHERE IdFuncionario = {0}", func.Id);
                    func.lstAtrasos = cn.Query<FuncionarioAtrasos>(queryAtrasos).ToList();
                }

                cn.Close();
            }

            return lstFuncionarios;
        }

        public void Desativar(long Id)
        {
            string query = string.Empty;

            query = string.Format("UPDATE Funcionarios SET Ativo = 0 WHERE Id = {0}", Id);

            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Execute(query);
                cn.Close();
            }
        }

        public void LancarAtraso(FuncionarioAtrasos atraso)
        {
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Insert(atraso);
                cn.Close();
            }
        }

        public void AtualizarAtraso(FuncionarioAtrasos atraso)
        {
            using (SqlConnection cn = new SqlConnection(_connstring))
            {
                cn.Open();
                cn.Update(atraso);
                cn.Close();
            }
        }
    }
}
