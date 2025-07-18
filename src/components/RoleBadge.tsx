export const Role = {
    ADMIN : "ADMIN",
    USER : "USER"

}as const;

type ROLE = typeof Role[keyof typeof Role];

export default function RoleBadge(role : ROLE)
{
    switch (role) {
        case Role.ADMIN:
            return (
                <div className="badge badge-soft badge-accent">ADMIN</div>
            )
        case Role.USER:
            return (
                <div>

                </div>
            )
        default:
            break;
    }

}