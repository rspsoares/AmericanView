using System.Configuration;

namespace AmericanView.Comum.Databases
{
    public class TipoBanco
    {
        public static Databases GetNomeBancoDados(out string connectionString)
        {
            Databases bancoDeDados;
            string bancoDados = ConfigurationManager.AppSettings["DatabaseType"].ToLower();
            connectionString = string.Empty;

            if (string.IsNullOrEmpty(bancoDados))
                bancoDados = "mysql";

            switch (bancoDados)
            {
                case "sqlserver":
                    bancoDeDados = Databases.SqlServer;
                    connectionString = ConfigurationManager.ConnectionStrings["SQL"].ConnectionString;
                    break;
                case "mysql":
                    bancoDeDados = Databases.Mysql;
                    connectionString = ConfigurationManager.ConnectionStrings["MYSQL"].ConnectionString;
                    break;
                default:
                    bancoDeDados = Databases.NotDefined;
                    break;
            }

            return bancoDeDados;
        }
    }
}
