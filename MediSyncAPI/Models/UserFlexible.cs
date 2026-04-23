using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediSyncAPI.Models
{
    [Table("Users")]
    public class UserFlexible
    {
        [Key]
        [Column("Id")]
        public string Id { get; set; } = string.Empty;
        
        [Column("Email")]
        public string Email { get; set; } = string.Empty;
        
        [Column("Password")]
        public string Password { get; set; } = string.Empty;
        
        [Column("FirstName")]
        public string FirstName { get; set; } = string.Empty;
        
        [Column("LastName")]
        public string LastName { get; set; } = string.Empty;
        
        // Try Role as int first, then convert to string
        [Column("Role")]
        public int RoleId { get; set; }
        
        [NotMapped]
        public string Role 
        { 
            get 
            {
                return RoleId switch
                {
                    1 => "Admin",
                    2 => "Doctor", 
                    3 => "Receptionist",
                    _ => "Doctor"
                };
            }
            set
            {
                RoleId = value switch
                {
                    "Admin" => 1,
                    "Doctor" => 2,
                    "Receptionist" => 3,
                    _ => 2
                };
            }
        }
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; }
    }
}