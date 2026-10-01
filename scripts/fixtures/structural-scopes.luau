--!strict
export type Item = { name: string, value: number }

local function summarize(items: {Item}): number
    local options = {
        prefix = "for if end do repeat until",
        nested = {
            enabled = true,
            description = [=[
                function fake()
                    if this then end
                end
            ]=],
        },
    }
    --[==[
        for fake = 1, 3 do
            end
        if function repeat until
    ]==]
    local total = 0
    for index, item in items do
        if item.value > 0 then
            while total < item.value do
                total += 1
            end
        elseif item.value == 0 then
            continue
        else
            do
                print(`Item: {item.name}, literal words: if end`)
            end
        end
    end
    repeat
        total += 1
    until total > 10
    return total
end

local render = function(value: number): string
    return `Value: {value}`
end

print(render(summarize({ { name = "demo", value = 4 } })))
