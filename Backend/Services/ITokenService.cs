using Backend.Model;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface ITokenService
    {
        Task<string> GenerateJwtToken(Users user);
    }
}
