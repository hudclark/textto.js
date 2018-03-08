class AddressCache {

    constructor () {
        this.internal = {}
        this.MAX_KEYS = 200
    }

    get (addr1, addr2) {
        return this.internal[addr1 + addr2]
    }

    put (addr1, addr2, match) {
        // Too many? Make space.
        const keys = Object.keys(this.internal)
        if (keys.length > this.MAX_KEYS) {
            keys.slice(0, 40).forEach(key => {
                delete this.internal[key]
            })
        }

        this.internal[addr1 + addr2] = match
    }
    
}

const cache = new AddressCache()

export function isMatch(addr1, addr2) {

    const cacheResult = cache.get(addr1, addr2)
    if (cacheResult === 1) return true
    if (cacheResult === 0) return false

    const normalized1 = normalize(addr1)
    const normalized2 = normalize(addr2)

    const match = (
        normalized1 == normalized2 ||
        new RegExp(`${normalized1}`).test(normalized2) ||
        new RegExp(`${normalized2}`).test(normalized1) ||
        // Lop off country codes
        new RegExp(`${normalized1.substr(3)}`).test(normalized2) ||
        new RegExp(`${normalized2.substr(3)}`).test(normalized1)
    )

    if (match) {
        cache.put(addr1, addr2, 1)
        return true
    } else {
        cache.put(addr1, addr2, 0)
        return false
    }
}

function normalize(addr) {
    return addr.replace(/\D/g, '')
}
