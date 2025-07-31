import { useRef } from "react";

export default function UserManagement()
{
    const editModal = useRef<HTMLDialogElement | null>(null);
    const onOpenCreateModal = () => {
        editModal.current?.showModal();
    }

    return(
        <div>
            <div className="tabs tabs-border">
            <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 1" defaultChecked/>
            <div className="tab-content border-base-300 bg-base-100 p-10">Tab content 1</div>

            <input type="radio" name="my_tabs_2" className="tab" aria-label="Tab 2"  />
            <div className="tab-content border-base-300 bg-base-100 p-10">
                <button className="btn btn-accent btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl" onClick={onOpenCreateModal}>새 계정 추가</button>
                <div>



                </div>
                


            </div>

            </div>


            <dialog ref={editModal} className="modal">
                <div className="modal-box">



                    <h3 className="font-bold text-lg">계정 생성</h3>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">사원 번호</legend>
                        <input type="email" ></input>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">이름</legend>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">이메일</legend>
                           
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">비밀 번호</legend>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">유저 타입</legend>
                      
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">부서</legend>
                    
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">직급</legend>
                    
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">근무 유형</legend>
                    
                    </fieldset>
                    <button className="btn" >생성</button>
                    <button className="btn">종료</button>



                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}