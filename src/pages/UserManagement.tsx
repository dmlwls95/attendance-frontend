export default function UserManagement()
{
    return(
        <div>
            <div className="tabs tabs-border">
            <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 1" defaultChecked/>
            <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 1</div>

            <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 2"  />
            <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 2</div>

            </div>
        </div>
    )
}