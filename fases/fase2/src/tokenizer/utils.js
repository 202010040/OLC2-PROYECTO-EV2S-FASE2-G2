import Tokenizer from "./Tokenizer.js"

export function generateTokenizer(grammar){
    console.log(grammar);
    const tokenizer = new Tokenizer()
    return `
    module tokenizer
    implicit none

    contains
    function nextSym(input, cursor) result(lexeme)
        character(len=*), intent(in) :: input
        integer, intent(inout) :: cursor
        character(len=:), allocatable :: lexeme
        integer :: i
        logical :: ejecuta_ciclo
        integer :: start_cursor
        character(len=:), allocatable :: lexeme_accumulated

        if (cursor > len(input)) then
            allocate( character(len=3) :: lexeme )
            lexeme = "EOF"
            return
        end if

        ${grammar.map((produccion) => produccion.accept(tokenizer)).join('\n')}

        print *, "error lexico en col ", cursor, ', "'//input(cursor:cursor)//'"'
        lexeme = "ERROR"
    end function nextSym

    !Autogenerado por default para validacion Case insensitive
    function to_lower(str) result(lower_str)
        character(len=*), intent(in) :: str
        character(len=len(str)) :: lower_str
        integer :: i

        lower_str = str
        do i = 1, len(str)
            if (iachar(str(i:i)) >= iachar('A') .and. iachar(str(i:i)) <= iachar('Z')) then
                lower_str(i:i) = char(iachar(str(i:i)) + 32)
            end if
        end do
    end function to_lower
    end module tokenizer 

    `
}

export function generateCaracteres(chars) {
    if (chars.length === 0) return '';
    return `
    if (findloc([${chars
        .map((char) => `"${char}"`)
        .join(', ')}], input(i:i), 1) > 0) then
        lexeme = input(cursor:i)
        cursor = i + 1
        return
    end if
    `;
}

export function CondicionalStrSencilla(node){
    let condicional = node.isCase 
    ? `cursor <= len(input) - ${node.val.length - 1} .and. to_lower(input(cursor:cursor + ${node.val.length - 1})) == "${node.val.toLowerCase()}"`
    : `cursor <= len(input) - ${node.val.length - 1} .and. input(cursor:cursor + ${node.val.length - 1}) == "${node.val}"`
    return condicional;
}