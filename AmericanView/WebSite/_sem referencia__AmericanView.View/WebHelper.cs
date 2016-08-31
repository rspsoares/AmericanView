using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Web;

namespace Keeptrue.Conciliador.View
{
    public class WebHelper
    {
        public bool GravarArquivo(string pasta, string arquivo, MemoryStream mStream, out string msgErro)
        {
            string linkArquivo = string.Empty;
            bool sucesso = false;

            msgErro = string.Empty;

            try 
            {
                Directory.CreateDirectory(pasta);
                //DirectoryInfo dInfo = new DirectoryInfo(pasta);
                //DirectorySecurity dSecurity = dInfo.GetAccessControl();
                //dSecurity.AddAccessRule(new FileSystemAccessRule(new SecurityIdentifier(WellKnownSidType.WorldSid, null), FileSystemRights.FullControl, InheritanceFlags.ObjectInherit | InheritanceFlags.ContainerInherit, PropagationFlags.NoPropagateInherit, AccessControlType.Allow));
                //dInfo.SetAccessControl(dSecurity);

                linkArquivo = Path.Combine(pasta, arquivo);

                using (FileStream file = new FileStream(linkArquivo, FileMode.CreateNew, FileAccess.ReadWrite))
                {
                    mStream.WriteTo(file);                 
                    mStream.Close();
                }

                sucesso = true;
            }
            catch (Exception ex)
            {
                msgErro = ex.ToString();
                sucesso = false;
            }

            return sucesso;
        }
    }
}