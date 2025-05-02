//using Microsoft.AspNetCore.Identity;

//namespace Backend.Services
//{
//    public class PasswordHasher<T> : IPasswordHasher<T> where T : class
//    {
//        private readonly Microsoft.AspNetCore.Identity.PasswordHasher<T> _passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<T>(); // Use ASP.NET's built-in PasswordHasher

//        public string HashPassword(T user, string password)
//        {
//            return _passwordHasher.HashPassword(user, password);  // Use user parameter as required by the interface
//        }

//        public string HashPassword(string password)
//        {
//            throw new NotImplementedException();
//        }

//        public PasswordVerificationResult VerifyHashedPassword(T user, string hashedPassword, string providedPassword)
//        {
//            return _passwordHasher.VerifyHashedPassword(user, hashedPassword, providedPassword);
//        }

//        public bool VerifyHashedPassword(string hashedPassword, string providedPassword)
//        {
//            throw new NotImplementedException();
//        }
//    }

//}
