using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace Backend.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<Users> _userManager;

        public TokenService(IConfiguration configuration, UserManager<Users> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
        }

        public async Task<string> GenerateJwtToken(Users user)
        {
            // Fetch roles for the user
            var userRoles = await _userManager.GetRolesAsync(user);

            // Default to "User" if no roles are found
            var roleName = userRoles.FirstOrDefault() ?? "User";

            // Ensure role is valid (Admin or User) and handle the case where no roles are assigned
            if (string.IsNullOrEmpty(roleName))
            {
                throw new Exception("User has no roles assigned.");
            }

            // Validate role name (optional but good practice)
            if (roleName != "Admin" && roleName != "User")
            {
                throw new Exception("Invalid role assigned to user.");
            }

            // Create claims based on user details and role
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),  // Ensure user ID is in string format
                new Claim(ClaimTypes.Name, user.UserName),                 // User's username
                new Claim(ClaimTypes.Email, user.Email),                   // User's email
                new Claim(ClaimTypes.Role, roleName)                       // User's role (either Admin or User)
            };

            // Fetch JWT configuration settings
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Set token expiration time to 1 month
            var expiration = DateTime.Now.AddMonths(1); // Token expires in 1 month

            // Create the JWT token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            // Return the JWT token as a string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
