using System.Web.Mvc;

namespace AmericanView.View.Controllers
{
    [AllowAnonymous]
    public class LoginController : Controller
    {
        //
        // GET: /Login/        
        //private readonly AuthenticationService<CustomUserAccount> _authSvc;
        //private readonly UserAccountService<CustomUserAccount> _userSvc;
        //private AuthorizationHelper claimHelper = new AuthorizationHelper();
        //private UsuarioLogado usuarioLogado = new UsuarioLogado();

        public LoginController()
        {
            
        }

        public ActionResult Index(string sessaoExpirada = "")
        {
            ViewBag.SesaoExpirada = sessaoExpirada;
            return View();
        }
        

        public ActionResult SignOut()
        {           
            return this.RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Index() //EntradaModel model
        {
            return this.RedirectToAction("Index", "Home");

            //if (this.ModelState.IsValid)
            //{
            //    CustomUserAccount account;
            //    if (_userSvc.AuthenticateWithUsernameOrEmail(model.Username, model.Password, out account))
            //    {
            //        _authSvc.SignIn(account, model.RememberMe);

            //        if (_userSvc.IsPasswordExpired(account))
            //        {
            //            return this.RedirectToAction("Login", "ChangePassword");
            //        }
            //        else
            //        {
            //            if (this.Url.IsLocalUrl(model.ReturnUrl))
            //            {
            //                return this.Redirect(model.ReturnUrl);
            //            }
            //            else
            //            {
            //                return this.RedirectToAction("Index", "Home");
            //            }
            //        }
            //    }
            //    else
            //    {
            //        ModelState.AddModelError("", "Usuário ou Senha Inválida");
            //    }

            //}
           // return this.View(model);
        }

        //[HttpPost]
        //[ValidateAntiForgeryToken]
        //public ActionResult RestorePass(RestauraEmail model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        try
        //        {
        //            var account = _userSvc.GetByEmail(model.Email);
        //            if (account != null)
        //            {
        //                if (!account.PasswordResetSecrets.Any())
        //                {
        //                    _userSvc.ResetPassword(model.Email);

        //                    return View("RestorePassSucess");
        //                }

        //                var vm = new PasswordResetWithSecretInputModel(account.ID);
        //                vm.Questions =
        //                    account.PasswordResetSecrets.Select(
        //                        x => new PasswordResetSecretViewModel
        //                        {
        //                            QuestionID = x.PasswordResetSecretID,
        //                            Question = x.Question
        //                        }).ToArray();

        //                return View("ResetWithQuestions", vm);
        //            }
        //            else
        //            {
        //                ModelState.AddModelError("", "E-mail não existe");
        //            }
        //        }
        //        catch (ValidationException ex)
        //        {
        //            ModelState.AddModelError("", ex.Message);
        //        }
        //    }
        //    return View("RestorePass");
        //}    
    }
}
