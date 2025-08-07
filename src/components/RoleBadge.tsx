export const Role = {
    ADMIN : "ADMIN",
    USER : "USER"

}as const;

//type ROLE = typeof Role[keyof typeof Role];

export default function RoleBadge(role : string | undefined)
{
    switch (role) {
        case "ADMIN":
            return (
                <div className="badge badge-soft badge-accent">ADMIN</div>
            )
        case "USER":
            return (
                <div className="badge badge-soft badge-accent">USER</div>
            )
        default:
            break;
    }

}