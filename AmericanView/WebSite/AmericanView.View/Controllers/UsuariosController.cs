using System.Web.Mvc;

namespace AmericanView.View.Controllers
{
    [Authorize]
    public class UsuariosController : Controller
    {
        //IUserAccountQuery _query;
        //IUsuarioUIDevolucaoFacade _usr;
        //ICadastrosFacade _cdr;
        //private readonly AuthenticationService<CustomUserAccount> _authSvc;
        //private readonly UserAccountService<CustomUserAccount> _userSvc;
        //private AuthorizationHelper claimHelper = new AuthorizationHelper();
        //private UsuarioLogado usuarioLogado = new UsuarioLogado();

        //public UsuariosController(
        //        IUserAccountQuery query, 
        //        IUsuarioUIDevolucaoFacade usr,
        //        AuthenticationService<CustomUserAccount> authSvc,
        //        UserAccountService<CustomUserAccount> userSvc,
        //        ICadastrosFacade cdr
        //    )
        //{
        //    _query = query;
        //    _usr = usr;
        //    _authSvc = authSvc;
        //    _userSvc = userSvc;
        //    _cdr = cdr;
        //    usuarioLogado = claimHelper.ObterUsuarioLogado(false);
        //}

        ////
        //// GET: /Usuarios/
        //[AuthorizeUser(AccessLevel = "/Usuarios")]
        //public ActionResult Index()
        //{
        //    ViewBag.NomeUsuario = usuarioLogado.Nome;
        //    return View();
        //}

        //[AuthorizeUser(AccessLevel = "/Usuarios/Create")]
        //public ActionResult Create()
        //{
        //    return PartialView();
        //}

        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public ActionResult Edit(int idUser)
        //{
        //    ViewBag.uqKeyUser = idUser;
        //    return PartialView();
        //}

        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public JsonResult GetEditableUser(string id)
        //{
        //    string msg;
        //    UsuarioEdicaoDto usuarioEdicao = _usr.RetornarEdicaoUsuario(id, out msg);
        //    if(!string.IsNullOrEmpty(msg))
        //        return Json(new { Sucesso = false, msg = "Erro ao obter dados do usuário" }, JsonRequestBehavior.AllowGet);

        //    return Json(new { Sucesso = true, msg = "", Data = usuarioEdicao }, JsonRequestBehavior.AllowGet);
        //}

        //[AuthorizeUser(AccessLevel = "/Usuarios")]
        //public ActionResult Details()
        //{
        //    return PartialView();
        //}

        ///// <summary>
        ///// Recuperar todos os usuários que o usuário requisitante tem a permissão de visualizar
        ///// </summary>
        ///// <returns>Lista de Usuários</returns>
        //[HttpGet]
        //public JsonResult PesquisarUsuarios()
        //{
        //    string msg;
        //    ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //    int origem = int.Parse(((from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/primarygroupsid") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //    int inscricao = int.Parse(((from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //    List<UsuarioListaDto> res = _usr.RetornarUsuarios(origem, inscricao, string.Empty, out msg);
        //    if(!string.IsNullOrEmpty(msg) && res.Count == 0)
        //        return Json(msg, JsonRequestBehavior.AllowGet);

        //    return Json(res, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //public JsonResult BuscarDetalhes(int idUsuario)
        //{
        //    string msg;
        //    ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //    UsuarioDetalhesDto data = _usr.RetornarDetalhes(idUsuario,
        //        ((from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value, 
        //        out msg);
        //    if(!string.IsNullOrEmpty(msg) && data == null)
        //        return Json(new { Sucesso = false }, JsonRequestBehavior.AllowGet);

        //    return Json(new { Sucesso = true, Data = data }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //public JsonResult BuscarPerfis()
        //{
        //    ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //    int origem = int.Parse(((from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/primarygroupsid") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //    string msg;
        //    List<PerfilListDto> perfis = _usr.RetornarPerfis(origem, out msg);
        //    if(!string.IsNullOrEmpty(msg) && perfis.Count == 0)
        //        return Json(new { Sucesso = false, Data = "Falha na busca de perfis" }, JsonRequestBehavior.AllowGet);
        //    return Json(new { Sucesso = true, Data = perfis }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpPost]
        //[AuthorizeUser(AccessLevel = "/Usuarios/Create")]
        //public JsonResult CriarUsuario(string nome, string login, string email, string telefone, bool ativo, int perfil, int? inscricao, int[] grupos)
        //{
        //    CustomUserAccount account = new CustomUserAccount();
            
        //    if (perfil == 0)
        //        return Json(new { sucesso = false, msg = "Favor selecionar um perfil." }, JsonRequestBehavior.AllowGet);

        //    try
        //    {
        //        //Não modificar!!!
        //        string password = System.Web.Security.Membership.GeneratePassword(12, 3);
        //        account.StartingPass = password;
        //        account = this._userSvc.CreateAccount("default", login, password, email, null, DateTime.Now, account);
        //    }
        //    catch(ValidationException ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //    try
        //    {                
        //        string[] nomeCompleto = nome.Split(' ');
        //        account.FirstName = nomeCompleto[0];
        //        account.LastName = nome.Replace(nomeCompleto[0] + " ", "");
        //        account.Inscription = inscricao == null ? 0 : (int)inscricao;                
        //        int origem;
        //        ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //        Guid usuarioCriador = new Guid(((from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //        string nomeUsuarioCriador = ((from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value;
        //        _usr.RequestUserUICreation(nome, login, email, telefone, ativo, inscricao == null ? 0 : (int)inscricao, perfil, account.ID, usuarioCriador, nomeUsuarioCriador, grupos == null ? new int[0] : grupos, out origem);
        //        account.Source = origem;
                
        //        this._userSvc.Update(account);
        //        ViewData["RequireAccountVerification"] = this._userSvc.Configuration.RequireAccountVerification;
        //    }
        //    catch(Exception ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //    return Json(new { sucesso = true, msg = "Usuário criado com sucesso!" }, JsonRequestBehavior.AllowGet);
        //}
    
        //[HttpGet]        
        //public JsonResult BuscarInscricoes()
        //{
        //    string msg = string.Empty;
        //    ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //    int inscricao = int.Parse(((from c in principal.Claims where c.Type.Equals(@"http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //    List<InscricoesListDto> inscricoes = _cdr.RetornarInscricoes(inscricao, out msg);

        //    if (!string.IsNullOrEmpty(msg) && inscricoes.Count == 0)
        //    {
        //        return Json(new { Sucesso = false, Data = msg }, JsonRequestBehavior.AllowGet);
        //    }

        //    return Json(new { Sucesso = true, Data = inscricoes }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //[AuthorizeUser(AccessLevel = "/Usuarios")]
        //public JsonResult InfoPerfil(int perfil)
        //{
        //    string msg = string.Empty;
        //    bool valorAdministrativo = _usr.RetornaEstadoAdministrativoPerfil(perfil, out msg);
        //    if (!string.IsNullOrEmpty(msg))
        //    {
        //        return Json(new { Sucesso = false, Data = string.IsNullOrEmpty(msg) ? "É necessário grupos para este tipo de cliente" : msg }, JsonRequestBehavior.AllowGet);
        //    }
        //    return Json(new { Sucesso = true, Data = valorAdministrativo }, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //public JsonResult BuscarGrupos(int conta)
        //{
        //    string msg = string.Empty;
        //    //List<GrupoListaDto> grupos = _usr.RetornarGrupos(conta, out msg);
        //    List<GrupoListaDto> grupos = _usr.RetornarGrupos(1, out msg);
        //    if (!string.IsNullOrEmpty(msg) || grupos.Count == 0)
        //    {
        //        return Json(new { Sucesso = false, Data = string.IsNullOrEmpty(msg) ? "É necessário grupos para este tipo de cliente" : msg }, JsonRequestBehavior.AllowGet);
        //    }

        //    return Json(new { Sucesso = true, Data = grupos }, JsonRequestBehavior.AllowGet);
        //}
        
        //[HttpPost]
        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public JsonResult ReenviarEmail(string idUsuario, string emailUsuario)
        //{   
        //    Guid uqusuario;
        //    string msg = string.Empty;

        //    if (emailUsuario != string.Empty)
        //    {
        //        UsuarioListaDto usuario = _usr.RetornarUsuarios(0, 0, emailUsuario, out msg).FirstOrDefault();
        //        idUsuario = usuario.uqUsuario.ToString();
        //    }

        //    if(!Guid.TryParse(idUsuario,out uqusuario))
        //        return Json(new { sucesso = false, msg = "Usuário não reconhecido" }, JsonRequestBehavior.AllowGet);
        //    CustomUserAccount account = new CustomUserAccount();
        //    try
        //    {
        //        _userSvc.ResetPassword(uqusuario);
        //        return Json(new { sucesso = true, msg = "Reenvio de acesso realizado." }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch(ValidationException ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //[HttpPost]
        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public JsonResult DesbloquearSenha(string idusuario)
        //{
        //    Guid uqusuario;
        //    if (!Guid.TryParse(idusuario, out uqusuario))
        //        return Json(new { sucesso = false, msg = "Usuário não reconhecido" }, JsonRequestBehavior.AllowGet);
        //    try
        //    {
        //        _userSvc.SetIsLoginAllowed(uqusuario, true);
        //        _usr.UpdateUserStats(null, false, null, uqusuario);
        //        return Json(new { sucesso = true, msg = "Usuário desbloqueado" }, JsonRequestBehavior.AllowGet);
        //    }
        //    catch (ValidationException ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //[HttpPost]
        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public JsonResult AtivarCliente(string idusuario, bool bloquear)
        //{
        //    Guid uqusuario;
        //    if (!Guid.TryParse(idusuario, out uqusuario))
        //        return Json(new { sucesso = false, msg = "Usuário não reconhecido" }, JsonRequestBehavior.AllowGet);
        //    try
        //    {
        //        if(bloquear)
        //        {
        //            _userSvc.SetIsLoginAllowed(uqusuario, false);
        //            _usr.UpdateUserStats(null, null, false, uqusuario);
        //            return Json(new { sucesso = true, msg = "Conta bloqueado" }, JsonRequestBehavior.AllowGet);
        //        }
        //        else
        //        {
        //            CustomUserAccount account = _userSvc.GetByID(uqusuario);
        //            _userSvc.SetIsLoginAllowed(uqusuario, true);
        //            _usr.UpdateUserStats(null, null, true, uqusuario);
        //            return Json(new { sucesso = true, msg = "Conta desbloqueada" }, JsonRequestBehavior.AllowGet);
        //        }
        //    }
        //    catch (ValidationException ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //}

        //[HttpPost]
        //[AuthorizeUser(AccessLevel = "/Usuarios/Edit")]
        //public JsonResult AtualizarUsuario(string nome, string login, string email, string telefone, bool ativo, int perfil, int? inscricao, int[] grupos, int iduser, Guid uquser)
        //{
        //    bool hasUserUpdated = false;
        //    CustomUserAccount account = new CustomUserAccount();
            
        //    if(perfil == 0)
        //        return Json(new { sucesso = false, msg = "Favor selecionar um perfil." }, JsonRequestBehavior.AllowGet);
                        
        //    try
        //    {
        //        account = this._userSvc.GetByID(uquser);

        //        //Verify if username has been changed
        //        if (account.Username != login)
        //        {
        //            hasUserUpdated = true;
        //            this._userSvc.ChangeUsername(uquser, login);
        //        }

        //        //Verify if email has been changed, if so requests account verification
        //        if (account.Email != email)
        //        {
        //            hasUserUpdated = true;
        //            this._userSvc.ChangeEmailRequest(uquser, email);
        //            this._userSvc.RequestAccountVerification(uquser);
        //            ViewData["RequireAccountVerification"] = this._userSvc.Configuration.RequireAccountVerification;
        //        }

        //        if (account.IsLoginAllowed != ativo)
        //        {
        //            hasUserUpdated = true;
        //            this._userSvc.SetIsLoginAllowed(uquser, ativo);
        //            _usr.UpdateUserStats(ativo, !ativo, ativo, uquser);
        //        }
        //    }
        //    catch (ValidationException ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }

        //    try
        //    {
        //        string[] nomeCompleto = nome.Split(' ');
        //        //flag to check if user update is required
        //        bool isAccountRequiringUpdate = false;
                
        //        //Verify is Firstname has been changed
        //        if (account.FirstName != nomeCompleto[0])
        //        {
        //            account.FirstName = nomeCompleto[0];
        //            isAccountRequiringUpdate = true;
        //        }

        //        //Verify if lastname has been changed
        //        if (account.LastName != nome.Replace(nomeCompleto[0] + " ", ""))
        //        {
        //            account.LastName = nome.Replace(nomeCompleto[0] + " ", "");
        //            isAccountRequiringUpdate = true;
        //        }

        //        //Verify if 'User Account' has been changed
        //        if (account.Inscription != (inscricao == null ? 0 : (int)inscricao))
        //        {
        //            account.Inscription = inscricao == null ? 0 : (int)inscricao;
        //            isAccountRequiringUpdate = true;
        //        }

        //        //if account has been changed then it will be updated
        //        if (isAccountRequiringUpdate)
        //        {
        //            hasUserUpdated = true;
        //            this._userSvc.Update(account);
        //        }                    

        //        int origem;
        //        //getting the requesting user UQKey and Name to fill in the user appliance for change
        //        ClaimsPrincipal principal = System.Web.HttpContext.Current.User as ClaimsPrincipal;
        //        Guid userUQRequestingEditing = new Guid(((from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value);
        //        string userNameRequestingEditing = ((from c in principal.Claims where c.Type.Equals(@"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name") select c).SingleOrDefault<System.Security.Claims.Claim>()).Value;
        //        //request user updated data
        //        _usr.RequestUserUIUpdate(nome, login, email, telefone, ativo, inscricao == null ? 0 : (int)inscricao, perfil, account.ID, userUQRequestingEditing, userNameRequestingEditing, grupos == null ? new int[0] : grupos, iduser, out origem, ref hasUserUpdated);

        //        if (account.Source != origem)
        //        {
        //            account.Source = origem;
        //            this._userSvc.Update(account);
        //        }                
        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { sucesso = false, msg = ex.Message }, JsonRequestBehavior.AllowGet);
        //    }
        //    return Json(new { sucesso = true, msg = hasUserUpdated ? "Usuário atualizado com sucesso!" : "Não existem campos a serem atualizados!" }, JsonRequestBehavior.AllowGet);
        //}    
    }
}
