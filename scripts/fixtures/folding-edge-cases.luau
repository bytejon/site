local function outer()
    local escaped = "quote: \" end"
    local text = [==[ function fake() end ]==]
    --[=[ if fake then end ]=]
    if true then
        local inner = function()
            return `interpolation: {1 + 2} and end`
        end
    end
end
