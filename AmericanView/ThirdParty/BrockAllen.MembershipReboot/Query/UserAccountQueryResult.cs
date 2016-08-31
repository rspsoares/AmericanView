/*
 * Copyright (c) Brock Allen.  All rights reserved.
 * see license.txt
 */

using System;
namespace BrockAllen.MembershipReboot
{
    public class UserAccountQueryResult
    {
        public Guid ID { get; set; }
        public string Tenant { get; set; }
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Perfil { get; set; }
        public bool ContaFechada { get; set; }
        public bool LoginPermitido { get; set; }
        public bool LoginConfirmado { get; set; }
    }
}
