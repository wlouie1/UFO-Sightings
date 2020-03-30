'use strict';
// TODO: Use ES6 Classes instead

const DATA_PATH = 'resources/data/ufo_sightings_final.csv';
// const DATA_PATH = 'resources/data/nuforc_reports_cleaned.csv';
// const DATA_PATH = 'resources/data/ufo_sightings_final.csv.gz'

// From https://stackoverflow.com/a/52112155 to get user locale
const getNavigatorLanguage = () => (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';

const ICONS_SET = {
    'ufo': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABNElEQVRIie3Uuy5EURQG4G8kMlOIyIjLQ4hLQcKjKHXjDXgAUYnQIxGFeAvTiUuhlzEFSpFR0IzirOHkDIczRudP/pzstdb+/31Z+/CPPmAY67jEM1q4wFrkfoUZ3KL9BRuY7lV8HA854h3eY6wXg+0fiHe49RPBCmoYinGjgMFNzBkKjUpWfAnNKC5H7KmAwVPMKce4icWO+AJeUsVTEd8sYLARc6ZTsRfMQz1TfIxSame7OMUdXoN3EdtJrbSEk4xWnaS3sys6RDV7jjmo4ugTnRacf7HtFvaxLHkPVQwGRzEbuYOo/UzjjO476Bff74DkrPNebFE2pLqogwpW+yBe89Hq792SRju+K5iTtN4EJjESuUfJb+QB17jCXo5ml0G7X7mB79x+iz83KIq8I/pHb3gDrCrFYt0IXhUAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/89110/sci-fi">Sci-Fi icon by Icons8</a>'
    },
    'egg': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAABf0lEQVRYhe3Xz0oXURiH8U9aGBJhBm4Mt0EYbgRRdNFe8AJcW9BGd11B6dKN4E66ha6ghYkIgqhXIEqJCv2BVNBsMfMD0fl3zswPN37hMMy8zPs858CcmeE+d5wHkff1YQ5j6fk3LOKoCamyvMMvXN0YP/G23fAPGeCbY6Fd8PcV4K0x0zR8EH8DBE4x1KTAWgC8NVabgk+VgDbxNac22YTAZonAM3TiJKO2URc+WAK/wkfM4l9O/VUdgYUKAlUEo7PbgMB2LPwpLgNA5znXL/AkD9JRIDBcUr+eeXRjIhW5ns60V7DAy4pwWJas1iq2QnoVCfQGCEynxyG8zqg/b7fAJxxL9ozukF4PC5oW1bKSO0s8yisUrcCPQIGiHMQIRD+/GdmJuekx/qi/Ef1GVx6kaAXOJI9X3Sy5vTdUTi++i5/9AXri3ZOMSlYjFH6KkbrwVsZxGAA/xpum4K28wGfFL6hLrKC/atOYH5MByWfaSCoF+1jHF+xF9LzP3eU/iMHwFXK2MUkAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/113227/egg">Egg icon by Icons8</a>'
    },
    'triangle': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA2klEQVRIie3RO0oDURiG4ceglVgJItikcAsWtqJNLNQVZBtxF7qGVMkS0rgDCzcQGDCKiFiIVaIp4oFBcpnLX6TIB6eY5nk5Z9hsXXaDDL9BJ8N1PjAKxNN5hsZf4CXoJfJ7zX+c4Sf4Bpf/i91AvDvvSvt4C8DfcbDo3doBgfYiPG1QA3/A1qpAE18V8G8cr8LTbisEOkVx2MZjCfwJO2UCcIJxAXyC07J42n2BwF1VHHYxXIJn2KsTgNaSwFVdPK0/B+9F4XCIjxz+iaPIAFyY/Y8hzqPx9d0UmA3ZuimHCbAAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/93873/triangle-arrow">Triangle Arrow icon by Icons8</a>'
    },
    'comet': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAADCElEQVRoge3ZTaiUVRzH8c/1ffCakZCbIkUr0F4swZdMwqULA4NatHARlLRqI7lpERQRQguzFrkSomUtohaBKxMxdWGQCW7kVhq9KEQp92b6tDjzOHNn5jx3npkzZzb3C7/FPM/MOb/ffc7zPy+XeeZJxQTuKz8sGKORYViPo/h33EYGZTEO4iZ2jtnLwOzABRQ4NGYvlSyJXL8Xn+COEOJHLMtlqg4NvI3dPe7twc9CgAK3sCWbsxq8gClcMrvwPIgvtQKUeje3wblYj6+1DO5vXl+A1/CX7hDnxYdfdhp4B9NaBn9vXn8C3+kOUAhldtMY/PbkOVzUbfI94R2Z6XGv1Fv57XZzPz4VN3mt4l6Bc1iU3XUbE9iHP1QbrdI0HsttvJ2HcdzgAUq9mdt4ySJhPFeN9351Cgvz2g9sxNmaZmO6gUfy2g9P4aDZJXVYvZE1ATbgTALj7Top4/ZiofRPocA/wqyfhUdxOnGAUq/nCrEPf48oxHFh7lmGF3EMK1MHaODwiAIUwiJxb7OPP5vXXk0dYp3WzmxUutPx+azEL/xW/DbiEJ263ew3GXuETX7OEAU+TBlik1AKc4f4VdijJ2GlsP3MHaLAS6lCEHZw4wjxTcoQq1TPE9PCGN6K5U1twxHDrXhvCtUxGa9UdPYLnqz47VO4MmCQ5FvZLyIdTc8RouRp9Z/MRSxNGQJ+inR2uEYbH0Xa6KXbeDaR97tMiP8165zubYu00UsfJPI+i8mKDidrtLOiop3OIdVI5L2L2ExeJ8g9kTZGPqTauRzpuM7aZ3ukjXa9n85ybz6LdHykRhsfR9oo9YMRVKlOXo50PiPME3OxWTinjYWYaX5n5KzQ2th06orqMJtxNfLbUllPRw5UGJkR5ontQgGYxDPCcKp6EgU+F0p8NhrCOO53LuhHF4xg/90Pawx3+Nyuq3goq/sOdhg+zBQez228F2vxvcFCnMDq/JbjLBb+r9fvEn2q+f2sJ+l1qshS7MLzQhl+QFiOXBfeg9P4Ct/iv7Q255lnbPwP+270IdxTdJwAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/11491/comet">Comet icon by Icons8</a>'
    },
    'rectangle': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAAfElEQVRIie2VQQqAIBBFX0bdqE5V56h9dJc6QgQdqIhaKRIiRQou5oEwoPw3uPkgpE5mzQXQAhWQ/8w9gRUYgON52QNX4NO5ttgiiDYdrixR+e5XPmEyle9VSEQkIhGJyC/aI+SbTFs0RxBNengWXwPUhCm+BRhxFJ+QJjepETYTJiHMVQAAAABJRU5ErkJggg==',
        'credit': '<a href="https://icons8.com/icon/98395/rectangle">Rectangle icon by Icons8</a>'
    },
    'cylinder': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAEHElEQVRoge3aSYxUVRQG4A8sG0XRRpJGEAVFggJBWsVEo2g07tSVkDgsWBjjzmgcNhpdmujOsNJETdSNK+PAwjmOcQSxNQ4oEhwaNd1I04Io5eLcl35VVFfd7i67ysifnLzKu6/u+f93h3POzZthajga/TgLy3AmlmAujsWcZLA32R8Ywg58nexLfIKDkyUyYxL/WY2rcBkuwnGTdV6HfXgbr+N5bGtTvzWYg1vwAarTZO8nn8WITgkV3Iyfp1FAvf2Ku9EzWRHLxPB2SkC9bRNrcEJYh9+6gHyj0VmXK2IphruA9Hg2hNNzhDzdBWRb2ZP1pBttv0PozVHcQQzhpPKNmR0i0nY0EvLitLOYOF7IeegM3b/Yl+QqvkRsdZ0mXW+/4OJcEfPTdSm2dgH5wrYkTmWOTfEtVqTfFZHvDHZQwGDiUEmcVuK7HCFVjOB2HJXuzRE513vTKODd5LNIGiu4Q2TJ1VwhhW3FerW720rchc2ivmgX8b1ix7zT2IyQfG/Ap3XP16BRQGyk9is8KqL+D6X7FazBcpFkLhPpQ68orE7E8enZEewRhdWwmB7lwmoL/ir1vQjX46bUb1PuuUIKHMKbeAmv4MM651NBBWtxBa4Uu1OzgN1SyIj8qm8/BsTb/EKM1i6xQIeFyOH0bG8i2yt2nVNxCs7GOWLKHpPpd0RGwfWczm+1rezZHLWrxTzuNNnxbBSrcoTANWL4Ok263kZwda6IYt2sEcGx0+QL2y7WUpljUzwjtk6i4L9VJGqdErAX95c4zdKgsGqEqthW+0v35uE205t7bU0+55V4nIuPUnuWkKo49XsYp9W19+NevGwsXWiH7RPx6R4xrctYjE1iOy+er0FOQDwoptvjeBV/l9p6krDl4qimODLNiew78E2y4sj0z1LfFVyOjSJNqqhFy3XS7K0N4hHcIIJZu7EINyYfu1twqUEjVfswO9PxLhHZPxNv9kchdrexiD6UrnPTtYjsfVgo8qhVIlFclOl3VEb2sVnnt9pWllWzn4cDXUB2PNuvdkdtivW6M00ZxbW5Igqsxc4uIF/YTpw/EQGPGTvCny2O9Pd0UMAIHjCWtvckji1RxVuiTijQlwR9Po0CBkRJ3VfisQLvpPYsIVWx4B/EyXXtF4jc5zXtXUejqc/7xLQuYwEeEgGzeL4GOZH9AJ7CE2KkDpXaZon8Z7k4c6qP7Ceojey/OzyybxeR/ePkq8BMcVC4EdclX624HyZkPNslcp4NDh+pdmBB6nuTKJubcanBVGv278W6GRCnIT+JyD4o3n5Vbc0+Q4zS/GQLxSiuEmtycabfIzV7N9n/r2Yv0M01+4TRjTX7lNAtNfu4mMxHNf3io5pLcaH8IqwVRkX68Yb4qGbLRP48GSFl/Js1+xH8p/EPFTAdQ7zO7VoAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/8305/database">Database icon by Icons8</a>'
    },
    'change': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAABQElEQVRoge3XPU7DQBBA4cePSJMbcEWUlpKh4yI5CAUIqlBxEEIfirACCZudtdeeGWef5CobZz45ydrQap1MAjxYDzE2AQ7fR1iM8IMIixH+IsJhhH5EGIyQR7jHCHqEW4xQjnCHEYYj3GCE8YhOzNkc0ys6ZF7PznleaRDzThayAjbAC/DJ+O+5SdfAm3LAUshs4NUECBPIZgKECeTVO0S7j+yBtXJtSenzc8Nm59RCpvqHqQZZzD5yWek85rc67Yr0ZLZbL+aKRIB8aBZFgLxrFkWAbGuerNatRumxA66iQ3YcHx2qNhdkDzwDNxReidr7iNkOH+HHrmqxkFuGPdh0veeu3pjD6sOUHOaI1BiMG0RqCMYdIlWCcYtIaTDuEan/MGEQqS5MOETqN8YV4qJw/RPH+6lH4L7+OK2Wu74A2yuhPutfRqIAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/53434/change">Change icon by Icons8</a>'
    },
    'diamond': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABFElEQVRIie3UMS4EURzH8U8QSydRcgGNREJUjqBzAKUb6NnFCZR6nStIJLKFhtArVBKdRIxYxc5LJi+sNztvNpH4Jf9uks/Mtxj+l7Yl3JS3PCl0BY8YlPeE1bbRTTxX0HAv2GoL3cbrN2i4N+zkRndRjEDDfWAvF7qPzwS0eidNwGmc1gSrd4aZumgH5w3QcBeYT0UXcJkBDXeNxRS4nxEN14+RqdQMDTdIeWgN7/J9bYH11DfsZoQPUlGYxW0G9B5zdWCaJ6+VOF6vAXw4LsrwRzJO8gdjJI5XN3mBjaZo2FENuJsLZZj8LgHNkjjeb8mzJo43KnmvLZSfk7eSOF6cvNXE8Y5NKHG8Dq7K60wS/rv7AlZgG+4TrLLaAAAAAElFTkSuQmCC',
        'credit': '<a href="https://icons8.com/icon/119771/kite-shape">Kite Shape icon by Icons8</a>'
    },
    'cross': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAAe0lEQVRIie2UQQqAIBAAp16X9P8PpP+wS0Gta5haBO3A3mQHkREMI2UGAhC38YB7Q+wP0n2Wu0uGCnHssWusEHfBxP8Uy07l5MidL+5c67R1ks619q5u1cLJ9ak3Dg94fMkhR993XoBJSuyvNrGJQe+8qNNWZOdqp4axAiXiTWBnJmeNAAAAAElFTkSuQmCC',
        'credit': '<a href="https://icons8.com/icon/80109/xbox-cross">Xbox Cross icon by Icons8</a>'
    },
    'honeycomb': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAA6ElEQVRIie2WPQ6CQBBGHxZaGS9h8FagiQ03EdBjamzptMKCpXD5cWeYqAUvmYJkli8MvF1gpiECCqACaq8qIHc95hx6Av1KrUPXwC0g+A5sLIPLgNC2CqvQLfAQBD+BnSZo4V1nwEqwfgkcLYJrxT00azrENOOTjDrGSL9CEJy7NfuA3o/6SXUy1S/kCRLXa6pfRDPGoXd2cj3ab2IyZ0FoWyV0dfoGo/qF6mE+asnppNGvF41OV0H/IBo90oDehBGmbJkh+g1yEYS+6SHlb04nzY+AyU4EhnpI+dnPHshOJ1Mm6zHj8wKh8ESyd2B7HwAAAABJRU5ErkJggg==',
        'credit': '<a href="https://icons8.com/icon/98905/honeycombs">Honeycombs icon by Icons8</a>'
    },
    'chevron': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAABmJLR0QA/wD/AP+gvaeTAAAA0klEQVRIie2TPQrCQBBGX+FB7IOChYUi2Hg9G2+hnYWNQkjhJSwE8RIi4k8TZVx2zey4EUEfDGyxOy/54IM/H2IArIA1MKpTcHUmmTAkSCbUCsxCq0AtbANFAoE7BdCSon3Ew2E52g/bSZE1Cm3UlSJX0Mffoyrhg2Mgojs9YOlZ4N7zRXqQoglwAnLnYRdYKKLxCfNy5xiHhjh3gDlwUUheCeXOJzJgZhCoe9QEpsD5TYHvDzMp2kRGE9OjrRR9XY9CJOuRFnOPrKh7lIo6dv4aNxwAF8bZ48mVAAAAAElFTkSuQmCC',
        'credit': '<a href="https://icons8.com/icon/10743/chevron">Chevron icon by Icons8</a>'
    },
    'drop': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA9UlEQVRIidWVPQ4BURRGDxGUopHoRKXwU88aprMBsSIqYRtKChQ6nR0QFoAoGBTeS4SHe2dG4Uu+ZDJ5c87NzWQGdGma/iQecDT14oYXgDVwNd0CxbjgKWD6ALedA+k4BF0H3LYTFe5/gNv6YeE5YCUQbIB8GMFAALcdaOEV4KQQnIGqRjBUwG2HUngJCEIILkD5GZZ0CNpv7n9LAmhJDi6EE7u6kAgOEQSHZ5hrFRfJFG9ylghWEQQvz7oE4wiCkeRQg3CvaQDUpJNoPhO2PSkcIAvMFPAJkNEIrKTP53UFZnI1/DF17j+dJbAHdua6g2Ln/5sbe/WzvOXIcZEAAAAASUVORK5CYII=',
        'credit': '<a href="https://icons8.com/icon/86415/water">Water icon by Icons8</a>'
    },
    'crescent': {
        'src': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAC1ElEQVRoge3Zz4uNURzH8dclNDR3I7IbZOHHwspKZCELyWQxjIWFlZV/wIKUf8DSSlEiO1mMKE3TFAvFwo+J0EgMFiTl92Nx5nKN53nuc+6v55nyrm893XvOuZ/Pfc6P7zmH/1SLWp9+ZwzbMINp3MMdXJv9bN5wHUlK/MBtHMFgaeoiWIBh3JRuKMEHnEC9JI3R7MIz2YZmMFqaukiW4axsMwkumyfdrYaT8s08wNqyBMZyXL6Zl9hQmroIargo38wrDJUlMIaleC7fzH3zZEbbJ99IgnOlqYtkXGszI6Wpi+CA1kZeCNN3pVksLIitzBwrS2AMF7Q2MoOB5koL+quxEBMFyqzEwV4L6ZQtWr+RBDfKEliUIcWMfMfyRqUqdq23BcstFDZrqKaRHxFlK20kJg1Z33ioopHVEWXXNR6qaGRTRNlKD/YdEWVTd5BjwmlHmeYW4Y1i02+Cz2mNfJr9crj3ejMZVtxEImOqfjr75c3e681kUpyRh2mNNO8FdvVc8r/sFWciwZVG5ebxcLfp+Yz+5vx1nG6jXuobOeRvt2f152y4hkvi30aCPWkNrhLSg+aCJ3vpYJZTLcRmxVc5WcCtlArH9ebN1DowkeBqXuNHMipdFI5sukVd+92pEbnnw4N4n1HxuXBk0yl75R9iF4lpYX+fy4kWjYxjf5GGmlgkLHax60RWHJ37A2l9v47Hwr44jzdCSjMp3D69xjth51bHGiEB3IHdWFHAcBGmsBlfihQe1Z1/rtvxEztjnV+ugPC50c6iaVC4nyhbfCNuiRuXf7FWuJ8o28SULoyxDcL9RJkmhjo10WBIuJ8oozt1a7b7TR3n+2TgpzCw2x4TRRgRVtZemXikjSm2XZYKR/tFrgCKxrSwYi/pl4lmBnBYOFD+XkDs3PgmZLGjOuxG3UzPl2M7tmKjMHWv9Gen+VFIa54IO7sJIW/72EUN/6kMvwAY5IjtesOgmAAAAABJRU5ErkJggg==',
        'credit': '<a href="https://icons8.com/icon/54382/crescent-moon">Crescent Moon icon by Icons8</a>'
    }
};

const UFO_SHAPE_ICONS = {
    '': ICONS_SET['ufo'],
    'oval': ICONS_SET['egg'],
    'cigar': ICONS_SET['egg'],
    'sphere': ICONS_SET['egg'],
    'circle': ICONS_SET['egg'],
    'egg': ICONS_SET['egg'],
    'round': ICONS_SET['egg'],
    'dome': ICONS_SET['ufo'],
    'disk': ICONS_SET['ufo'],
    'other': ICONS_SET['ufo'],
    'unknown': ICONS_SET['ufo'],
    'triangle': ICONS_SET['triangle'],
    'delta': ICONS_SET['triangle'],
    'pyramid': ICONS_SET['triangle'],
    'cone': ICONS_SET['triangle'],
    'light': ICONS_SET['comet'],
    'fireball': ICONS_SET['comet'],
    'flash': ICONS_SET['comet'],
    'flare': ICONS_SET['comet'],
    'rectangle': ICONS_SET['rectangle'],
    'cylinder': ICONS_SET['cylinder'],
    'formation': ICONS_SET['honeycomb'],
    'changing': ICONS_SET['change'],
    'changed': ICONS_SET['change'],
    'diamond': ICONS_SET['diamond'],
    'cross': ICONS_SET['cross'],
    'hexagon': ICONS_SET['honeycomb'],
    'chevron': ICONS_SET['chevron'],
    'teardrop': ICONS_SET['drop'],
    'crescent': ICONS_SET['crescent']
};


// ========== Data Utilities ==========

function DataManager(dataPath) {
    this.dataPath = dataPath;
}

DataManager.prototype._loadData = function() {
    let self = this;

    let dateParser = function(dateString) {
        let date_time = dateString.split(' ');
        let date = date_time[0];
        let time = date_time[1];
        let date_parts = date.split('/');
        let month = date_parts[0].length > 1 ? date_parts[0] : '0' + date_parts[0];
        let day = date_parts[1].length > 1 ? date_parts[1] : '0' + date_parts[1];
        let year = date_parts[2];
        let isoString = year + '-' + month + '-' + day + 'T' + time + ':00Z';
        return new Date(isoString);
    };

    return d3.csv(this.dataPath, function(d) {
        d.datetime = dateParser(d.datetime);
        d.duration_seconds = parseFloat(d.duration_seconds);
        d.latitude = parseFloat(d.latitude);
        d.longitude = parseFloat(d.longitude);
        d.date_documented = new Date(d.date_documented);
        return d;
    }).then(function(data) {
        self._data = data.sort(function(a, b) {
            return a.datetime - b.datetime;
        });
        return self._data;
    });
};

DataManager.prototype._loadCompressedData = function() {
    let self = this;

    let dateParser = function(dateString) {
        let date_time = dateString.split(' ');
        let date = date_time[0];
        let time = date_time[1];
        let date_parts = date.split('/');
        let month = date_parts[0].length > 1 ? date_parts[0] : '0' + date_parts[0];
        let day = date_parts[1].length > 1 ? date_parts[1] : '0' + date_parts[1];
        let year = date_parts[2];
        let isoString = year + '-' + month + '-' + day + 'T' + time + ':00Z';
        return new Date(isoString);
    };

    return fetch(DATA_PATH).then(function(response) {
        return response.arrayBuffer();
    }).then(function(arrayBuffer) {
        let buffer = new Uint8Array(arrayBuffer)
        let gunzip = new  Zlib.Gunzip(buffer); 
        let plain = gunzip.decompress();

        // Create ascii string from bytes.
        let asciistring = "";
        for (let i = 0; i < plain.length; i++) {         
            asciistring += String.fromCharCode(plain[i]);
        }

        return d3.csvParse(asciistring, function(d) {
            d.datetime = dateParser(d.datetime);
            d.duration_seconds = parseFloat(d.duration_seconds);
            d.latitude = parseFloat(d.latitude);
            d.longitude = parseFloat(d.longitude);
            d.date_documented = new Date(d.date_documented);
            return d;
        })
    }).then(function(data) {
        self._data = data.sort(function(a, b) {
            return a.datetime - b.datetime;
        });
        return self._data;
    });
};

DataManager.prototype._groupBy = function(dateComponent) {
    let dMap = {};
    let ds = [];

    for (let i = 0; i < this._data.length; i++) {
        let month = this._data[i].datetime.getUTCMonth();
        let day = this._data[i].datetime.getUTCDate();
        let year = this._data[i].datetime.getUTCFullYear();

        let d;
        switch (dateComponent) {
            case 'year':
                d = new Date(year, 0);
                break;
            case 'day':
                d = new Date(year, month, day);
                break;
        }
        // let d = new Date(this._data[i].datetime.toDateString());
        if (dMap[d] != null) {
            dMap[d].reports.push(this._data[i]);
        } else {
            dMap[d] = { date: d, reports: [ this._data[i] ] };
            ds.push(d);
        }
    }

    let groupedData = ds.map(function(d) {
        return dMap[d];
    });

    return { data: groupedData, map: dMap };
};

DataManager.prototype.loadAndProcessData = function () {
    let self = this;

    return this._loadData().then(function() {
        let dayGroup = self._groupBy('day');
        self._dayData = dayGroup.data;
        self._dayMap = dayGroup.map;

        let yearGroup = self._groupBy('year');
        self._yearData = yearGroup.data;
        self._yearMap = yearGroup.map;
    });
};

DataManager.prototype.getData = function() {
    return this._data;
};

DataManager.prototype.getDayData = function() {
    return this._dayData;
};

DataManager.prototype.getDayMap = function() {
    return this._dayMap;
};

DataManager.prototype.getYearData = function() {
    return this._yearData;
};

DataManager.prototype.getYearMap = function() {
    return this._yearMap;
};

DataManager.prototype.getReports = function(dateComponent, dateCompMap) {
    if (dateCompMap[dateComponent] == null) {
        return [];
    }
    return dateCompMap[dateComponent].reports;
};

DataManager.prototype.getReportsInRange = function(startDate, endDate) {
    let startTime = startDate.getTime();
    let endTime = endDate.getTime();

    return this._data.filter(function(d) {
        let time = d.datetime.getTime();
        return time > startTime && time < endTime;
    });
};


// ========== Render Utilities ==========

function LoadingRenderer(dataManager) {
    this._dataManager = dataManager;
    this._minLoadingTime = 1000; // milliseconds
}

LoadingRenderer.prototype.render = function(container) {
    let self = this;
    this._container = container;

    // Loading screen already defined in HTML and CSS
    // Ensure loading time is at least _minLoadingTime
    this._renderPromise = new Promise(function(resolve, _) {
        setTimeout(resolve, self._minLoadingTime);
    });

    return this._renderPromise;
};

LoadingRenderer.prototype.remove = function() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    // Removal is complete after removal animation ends
    let loadingContainer = this._container;
    loadingContainer.addEventListener('transitionend', function() {
        loadingContainer.parentNode.removeChild(loadingContainer);
        whenReadyResolve();
    });

    // Make sure remove only happens after render complete
    return this._renderPromise.then(function() {
        loadingContainer.classList.remove('visible');
        loadingContainer.classList.add('invisible');
        return whenReadyPromise;
    });
};

// ==================================================

function MapRenderer(dataManager) {
    this._dataManager = dataManager;
    this._selectionEnabled = true;
    this._focusedMarkersCenter = { x: -1, y: -1 };
    this._focusedMarkers = [];
    this._selectedMarkers = [];
    this._selectionRadius = 50;
}

MapRenderer.prototype._renderMap = function(container) {
    let self = this;

    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let map = L.map(container.querySelector('.map'), {
        preferCanvas: true,
        zoomControl: false,
        // maxBounds: [[-90,-180], [90, 180]],
        // maxBoundsViscosity: 1.0,
        zoomSnap: 0.1,
        attributionControl: false
    }).on('load', whenReadyResolve);

    L.control.attribution({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'topright', maxWidth: 100 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    
    let urlTemplate = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
    let options = {
        attribution: '&copy; ' + 
                    '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' +
                    ' contributors &copy; ' +
                    '<a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
        // noWrap: true,
        // bounds: [[-90,-180], [90,180]]
    };

    let CartoDB_DarkMatterNoLabels = L.tileLayer(urlTemplate, options);
    CartoDB_DarkMatterNoLabels.addTo(map);

    // map.setView([24, 0], 2.8);
    // map.setView([0, 0], 2);
    map.fitBounds([
        [-53.108179180323226, -186.865267512287],
        [74.0357352612601, 186.6860530092097]
    ]);

    map.on('zoomend', function() {
        self._rebuildQuadTree();
        self._focusRadiusMarkers(self._focusedMarkersCenter);
        self._renderTooltip();
        // console.log(event)
    });

    this._map = map;
    this._reportsLayer = L.layerGroup().addTo(map);
    this._markersData = [];
    this._emptyQuadTree();

    // console.log(this._map.getBounds())

    let sideMapBlocker = container.querySelector('.map-side-map-blocker');
    sideMapBlocker.addEventListener('click', function() {
        self._deSelectRadiusMarkers();
    });

    let sidePanel = container.querySelector('.map-side-panel');
    sidePanel.addEventListener('transitionend', function() {
        let sidePanelContainer = container.querySelector('.map-side-panel-container');
        let sidePanelDetail = container.querySelector('.detail');
        if (sidePanelContainer.classList.contains('opened')) {
            sidePanelDetail.classList.remove('invisible');
            sidePanelDetail.classList.add('visible');
        } else {
            sidePanelDetail.classList.add('invisible');
            sidePanelDetail.classList.remove('visible');
        }
    });
    


    // let sidePanel = document.querySelector('.map-side-panel');
    // console.log(sidePanel);
    // sidePanel.addEventListener('click', function(event) {
    //     console.log(event);
    //     event.stopPropagation();
    // });
    // L.DomEvent.disableScrollPropagation(sidePanel);
    // L.DomEvent.disableClickPropagation(sidePanel);
    // this._markersQuadTree = d3.quadtree()
    //     .x(function(d) { return d.report.latitude; })
    //     .y(function(d) { return d.report.longitude; });
    // this._reportsLayer = L.markerClusterGroup().addTo(map);
    // this._cityLayerMap = {};
    // this._heatLayer = L.heatLayer([], {radius: 25, blur: 15, gradient: {0: 'yellow', 1: 'red'}}).addTo(map);

    return whenReadyPromise;
};

MapRenderer.prototype._emptyQuadTree = function() {
    let self = this;

    this._markersQuadTree = d3.quadtree()
        .x(function(d) { return self._map.latLngToLayerPoint([d.report.latitude, d.report.longitude]).x; })
        .y(function(d) { return self._map.latLngToLayerPoint([d.report.latitude, d.report.longitude]).y; });
};

MapRenderer.prototype._rebuildQuadTree = function() {
    let self = this;
    
    this._markersQuadTree = d3.quadtree()
        .x(function(d) { return self._map.latLngToLayerPoint([d.report.latitude, d.report.longitude]).x; })
        .y(function(d) { return self._map.latLngToLayerPoint([d.report.latitude, d.report.longitude]).y; })
        .addAll(this._markersData);
};

MapRenderer.prototype._toDateString = function(date) {
    let locale = getNavigatorLanguage();
    let options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
    return date.toLocaleString(locale, options);
};

MapRenderer.prototype._renderTooltip = function() {
    if (!this._selectionEnabled) {
        this._hideTooltip();
        return;
    }

    let containerWidth = this._container.clientWidth;

    let radiusTooltip = this._container.querySelector('.radius-tooltip');
    if (radiusTooltip.classList.contains('invisible')) {
        radiusTooltip.classList.remove('invisible');
        radiusTooltip.classList.add('visible');
    }

    let radiusTooltipContent = this._container.querySelector('.radius-tooltip .tooltip-content-container');
    let tooltipWidth = radiusTooltipContent.clientWidth;
    let tooltipHeight = radiusTooltip.clientHeight;
    let radiusTooltipArrowTop = this._container.querySelector('.radius-tooltip .tooltip-arrow-top');
    let radiusTooltipArrowBottom = this._container.querySelector('.radius-tooltip .tooltip-arrow-bottom');
    let radiusTooltipl1 = this._container.querySelector('.radius-tooltip-l1');
    let radiusTooltipl2 = this._container.querySelector('.radius-tooltip-l2');
    let radiusTooltipl3 = this._container.querySelector('.radius-tooltip-l3');
    let radiusTooltipl4 = this._container.querySelector('.radius-tooltip-l4');
    
    let numReports = this._focusedMarkers.length;
    let approxRadiusKM = this._map.containerPointToLatLng(this._focusedMarkersCenter).distanceTo(
        this._map.containerPointToLatLng([this._focusedMarkersCenter.x + this._selectionRadius, this._focusedMarkersCenter.y])
    ) / 1000;
    let dateStart = new Date(Math.min.apply(Math, this._focusedMarkers.map(function(markerReport) { return markerReport.report.datetime; })));
    let dateEnd = new Date(Math.max.apply(Math, this._focusedMarkers.map(function(markerReport) { return markerReport.report.datetime; })));
    radiusTooltipl1.innerHTML = numReports > 1 ? 'Number of Reports (Zoom in to reduce): ' + numReports : 'Number of Reports: ' + numReports;
    radiusTooltipl2.innerHTML = 'Radius (Approx km): ' + (approxRadiusKM > 1 ? Math.round(approxRadiusKM) : approxRadiusKM.toPrecision(3)); 
    radiusTooltipl3.innerHTML = numReports > 0 ? 'Oldest Report: ' + this._toDateString(dateStart) : '';
    radiusTooltipl4.innerHTML = numReports > 0 ? 'Latest Report: ' + this._toDateString(dateEnd) : '';

    let tooltipTop = this._focusedMarkersCenter.y - this._selectionRadius - tooltipHeight;
    let radiusTooltipArrow;
    if (tooltipTop > 0) {
        radiusTooltipArrowBottom.classList.remove('invisible');
        radiusTooltipArrowBottom.classList.add('visible');
        radiusTooltipArrowTop.classList.remove('visible');
        radiusTooltipArrowTop.classList.add('invisible');
        radiusTooltipArrow = radiusTooltipArrowBottom;
    } else {
        tooltipTop = this._focusedMarkersCenter.y + this._selectionRadius;
        radiusTooltipArrowTop.classList.remove('invisible');
        radiusTooltipArrowTop.classList.add('visible');
        radiusTooltipArrowBottom.classList.remove('visible');
        radiusTooltipArrowBottom.classList.add('invisible');
        radiusTooltipArrow = radiusTooltipArrowTop;
    }
    tooltipTop = tooltipTop + 'px';
    let tooltipArrowTop = tooltipTop;

    let tooltipLeft;
    let tooltipHalfWidth = tooltipWidth / 2;
    if (this._focusedMarkersCenter.x < tooltipHalfWidth) {
        tooltipLeft = '0px';
    } else if (this._focusedMarkersCenter.x > containerWidth - tooltipHalfWidth) {
        tooltipLeft = (containerWidth - tooltipWidth) + 'px'
    } else {
        tooltipLeft = (this._focusedMarkersCenter.x - tooltipHalfWidth) + 'px';
    }
    let tooltipArrowLeft = this._focusedMarkersCenter.x - 8 + 'px';

    radiusTooltipContent.style.top = tooltipTop;
    radiusTooltipContent.style.left = tooltipLeft;
    radiusTooltipArrow.style.top = tooltipArrowTop;
    radiusTooltipArrow.style.left = tooltipArrowLeft;
};

MapRenderer.prototype._hideTooltip = function() {
    let radiusTooltip = this._container.querySelector('.radius-tooltip');
    if (radiusTooltip.classList.contains('visible')) {
        radiusTooltip.classList.remove('visible');
        radiusTooltip.classList.add('invisible');
    }
};

MapRenderer.prototype._renderSelectionOverlay = function(container) {
    let self = this;
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    if (this._container == container) {
        this._svg.attr('width', containerWidth)
            .attr('height', containerHeight);
        return;
    }

    this._container = container;

    let overlay = container.querySelector('.map-overlay');

    this._svg = d3.select(overlay)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    this._selectionCircle = this._svg.append('ellipse')
        .attr('class', 'map-selection-radius');

    // let radiusTooltip = selectionG.append('g');
    // radiusTooltip.append('rect')
    //     .attr('')

    let renderFocusFeedback = function(event) {
        if (!self._selectionEnabled) {
            self._selectionCircle.classed('visible', false);
            self._selectionCircle.classed('invisible', true);
            self._hideTooltip();
            return;
        }

        self._selectionCircle.classed('visible', true);
        self._selectionCircle.classed('invisible', false);

        let pos = event.containerPoint;
        let xPos = event.containerPoint.x;
        let yPos = event.containerPoint.y;

        self._selectionCircle.attr('cx', xPos)
            .attr('cy', yPos)
            .attr('rx', self._selectionRadius)
            .attr('ry', self._selectionRadius);

        self._focusRadiusMarkers(pos);
    };

    self._map.on('mouseover', renderFocusFeedback);

    self._map.on('mousemove', function(event) {
        renderFocusFeedback(event);
        self._renderTooltip();
    });

    self._map.on('mouseout', function() {
        self._selectionCircle.classed('visible', false);
        self._selectionCircle.classed('invisible', true);
        self._hideTooltip();
    
        if (self._selectedMarkers.length > 0) {
            return;
        }
        self._deFocusRadiusMarkers();
    });

    self._map.on('click', function(event) {
        if (!self._selectionEnabled) {
            return;
        }

        let pos = event.containerPoint;
        if (self._focusedMarkersCenter.x != pos.x || self._focusedMarkersCenter.y != pos.y) {
            self._focusRadiusMarkers(pos);
        }
        
        if (self._focusedMarkers.length > 0) {
            self._selectRadiusMarkers();
        }
        
        // if (self._focusedMarkers.length == 0) {
        //     self._deSelectRadiusMarkers();
        //     // document.querySelector('.map-side-panel').style.width = '0px';
        // } else {
        //     self._selectRadiusMarkers();
        //     // document.querySelector('.map-side-panel').style.width = '30%';

        //     // console.log(self._selectedMarkers.length)
        // }
    });

    return Promise.resolve();
};

MapRenderer.prototype.render = function(container) {
    let self =  this;

    // On window resize, rerender the svgs
    window.addEventListener('resize', function() {
        self._renderSelectionOverlay(container);
    });

    return Promise.all([
        this._renderMap(container),
        this._renderSelectionOverlay(container)
    ]);
};

MapRenderer.prototype._focusRadiusMarkers = function(centerPos) {
    let self = this;

    // Reset previously focused markers
    this._deFocusRadiusMarkers();
    this._selectedMarkers = [];

    this._focusedMarkersCenter = centerPos;
    this._focusedMarkers = [];
    let layerCenterPos = this._map.containerPointToLayerPoint(centerPos);
    this._markersQuadTree.visit(function(node, x0, y0, x1, y1) {
        if (!node.length) {
          do {
            let markerReport = node.data;
            let latLng = [markerReport.report.latitude, markerReport.report.longitude];
            let pos = self._map.latLngToContainerPoint(latLng);

            // Focus marker if inside selection ring
            let x = pos.x - centerPos.x;
            let y = pos.y - centerPos.y;
            if (x * x + y * y < self._selectionRadius * self._selectionRadius) {
                self._focusedMarkers.push(markerReport);
            }
          } while (node = node.next);
        }
    
        // Prune quadrant if it doesn't overlap selection ring
        // let rectLowerPos = self._map.latLngToContainerPoint([lat0, lng0]);
        // let rectUpperPos = self._map.latLngToContainerPoint([lat1, lng1]);
        // let x0 = rectLowerPos.x;
        // let y0 = rectLowerPos.y;
        // let x1 = rectUpperPos.x;
        // let y1 = rectUpperPos.y;
        let width = x1 - x0;
        let height = y1 - y0;
        let dx = layerCenterPos.x - Math.max(x0, Math.min(layerCenterPos.x, x0 + width));
        let dy = layerCenterPos.y - Math.max(y0, Math.min(layerCenterPos.y, y0 + height));
        return (dx * dx + dy * dy) >= (self._selectionRadius * self._selectionRadius);
        // return false;
    });

    this._focusedMarkers.forEach(function(markerReport) {
        // turn them green
        markerReport.marker.setStyle({ fillColor: 'green' });
    });
};

MapRenderer.prototype._deFocusRadiusMarkers = function() {
    this._focusedMarkers.forEach(function(markerReport) {
        markerReport.marker.setStyle({ fillColor: '#d7ba7d' });
    });
};

MapRenderer.prototype._selectRadiusMarkers = function() {
    let self = this;
    this._selectedMarkers = this._focusedMarkers;

    // this._selectedMarkers.forEach(function(markerReport) {
    //     // turn them green

    //     // markerReport.marker.setStyle({ fillColor: 'green' });
    //     // self._renderTooltip();

    //     // bring up side panel + pan map

    //     // add marker with ufo shape?

    // });

    let selectionChangeEvent = new CustomEvent('selectionChange', {
        bubbles: true,
        detail: {
            value: self._selectedMarkers.map(function(markerReport) {
                return markerReport.report;
            }).sort(function(a, b) {
                return b.datetime - a.datetime;
            })
        }
    });

    this._container.dispatchEvent(selectionChangeEvent);

    // Update side panel
    // this._updateSidePanel();

    // Open side panel
    this._openSidePanel();

    // Hide title thing
    let vizTitle = this._container.querySelector('.viz-title-container');
    vizTitle.classList.remove('visible');
    vizTitle.classList.add('invisible');
};

MapRenderer.prototype._deSelectRadiusMarkers = function() {
    // Close side panel
    this._closeSidePanel();

    // Show title thing
    let vizTitle = this._container.querySelector('.viz-title-container');
    vizTitle.classList.add('visible');
    vizTitle.classList.remove('invisible');

    // Remove current marker
    if (this._currentReportMarker != null) {
        this._map.removeLayer(this._currentReportMarker);
    }

    // this._selectedMarkers.forEach(function(markerReport) {
    //     // close side panel + pan map

    //     // turn them yellow etc.

    // });

    this._selectedMarkers = [];
    this._selectionCircle.classed('visible', false);
    this._selectionCircle.classed('invisible', true);
    this._deFocusRadiusMarkers();
    this._hideTooltip();

    let deselectionEvent = new CustomEvent('deselection', {
        bubbles: true,
        detail: null
    });

    this._container.dispatchEvent(deselectionEvent);
};

MapRenderer.prototype.enableSelection = function() {
    this._selectionEnabled = true;
};

MapRenderer.prototype.disableSelection = function() {
    this._selectionEnabled = false;
    this._deSelectRadiusMarkers();
};

MapRenderer.prototype._openSidePanel = function() {
    let sidePanel = this._container.querySelector('.map-side-panel-container');
    sidePanel.classList.add('opened');
    this._prevCenter = this._map.getCenter();
    this._map.panTo(this._map.containerPointToLatLng(this._focusedMarkersCenter), {
        animate: true,
        duration: 0.5
    });
};

MapRenderer.prototype._closeSidePanel = function() {
    let sidePanel = this._container.querySelector('.map-side-panel-container');
    sidePanel.classList.remove('opened');

    let sidePanelDetail = this._container.querySelector('.detail');
    sidePanelDetail.classList.remove('visible');
    sidePanelDetail.classList.add('invisible');

    if (this._prevCenter != null) {
        this._map.panTo(this._prevCenter, {
            animate: true,
            duration: 0.5
        });
    }
};

// MapRenderer.prototype._updateSidePanel = function() {
//     let sidePanelDetail = this._container.querySelector('.detail');
//     // selectionDetail.innerHTML = JSON.stringify(this._selectedMarkers.map(function(markerReport) {
//     //     return markerReport.report;
//     // }));
//     console.log(this._selectedMarkers.map(function (markerReport) {
//         return markerReport.report;
//     }));
//     // sidePanelDetail.innerHTML = 'Facilisis primis ornare volutpat a neque morbi blandit iaculis eu pharetra porta. Dictum, nunc lacus dis. Taciti velit malesuada a posuere class pharetra mi! Congue lorem rutrum odio vel ullamcorper netus purus pulvinar ad vitae blandit? Magna auctor dui auctor dictum a imperdiet nam eget. Ligula sit laoreet sociis faucibus neque. Arcu eu laoreet turpis nunc fringilla sit orci hac. Nostra tortor quis, potenti etiam pretium. Ad aliquet vehicula viverra platea praesent a euismod quis leo? Vitae egestas risus venenatis, quisque.Facilisis primis ornare volutpat a neque morbi blandit iaculis eu pharetra porta. Dictum, nunc lacus dis. Taciti velit malesuada a posuere class pharetra mi! Congue lorem rutrum odio vel ullamcorper netus purus pulvinar ad vitae blandit? Magna auctor dui auctor dictum a imperdiet nam eget. Ligula sit laoreet sociis faucibus neque. Arcu eu laoreet turpis nunc fringilla sit orci hac. Nostra tortor quis, potenti etiam pretium. Ad aliquet vehicula viverra platea praesent a euismod quis leo? Vitae egestas risus venenatis, quisque.Facilisis primis ornare volutpat a neque morbi blandit iaculis eu pharetra porta. Dictum, nunc lacus dis. Taciti velit malesuada a posuere class pharetra mi! Congue lorem rutrum odio vel ullamcorper netus purus pulvinar ad vitae blandit? Magna auctor dui auctor dictum a imperdiet nam eget. Ligula sit laoreet sociis faucibus neque. Arcu eu laoreet turpis nunc fringilla sit orci hac. Nostra tortor quis, potenti etiam pretium. Ad aliquet vehicula viverra platea praesent a euismod quis leo? Vitae egestas risus venenatis, quisque.Facilisis primis ornare volutpat a neque morbi blandit iaculis eu pharetra porta. Dictum, nunc lacus dis. Taciti velit malesuada a posuere class pharetra mi! Congue lorem rutrum odio vel ullamcorper netus purus pulvinar ad vitae blandit? Magna auctor dui auctor dictum a imperdiet nam eget. Ligula sit laoreet sociis faucibus neque. Arcu eu laoreet turpis nunc fringilla sit orci hac. Nostra tortor quis, potenti etiam pretium. Ad aliquet vehicula viverra platea praesent a euismod quis leo? Vitae egestas risus venenatis, quisque.Facilisis primis ornare volutpat a neque morbi blandit iaculis eu pharetra porta. Dictum, nunc lacus dis. Taciti velit malesuada a posuere class pharetra mi! Congue lorem rutrum odio vel ullamcorper netus purus pulvinar ad vitae blandit? Magna auctor dui auctor dictum a imperdiet nam eget. Ligula sit laoreet sociis faucibus neque. Arcu eu laoreet turpis nunc fringilla sit orci hac. Nostra tortor quis, potenti etiam pretium. Ad aliquet vehicula viverra platea praesent a euismod quis leo? Vitae egestas risus venenatis, quisque.'
// };

MapRenderer.prototype.handleCurrentDateChange = function(event) {
    let self = this;

    let prevRenderDate = this._prevRenderDate != null ? this._prevRenderDate : this._dataManager.getData()[0].datetime;
    let currRenderDate = event.detail.value;

    if (currRenderDate.getTime() <= prevRenderDate.getTime()) {
        this._reportsLayer.clearLayers();
        this._markersData = [];
        this._emptyQuadTree();
        prevRenderDate = this._dataManager.getData()[0].datetime;
    }
    let reports = this._dataManager.getReportsInRange(prevRenderDate, currRenderDate);

    this._prevRenderDate = currRenderDate;

    // Update title
    let vizTitleDate = this._container.querySelector('.viz-title-daterange');
    vizTitleDate.innerHTML = event.detail.overallStart.getUTCFullYear() + ' - ' + currRenderDate.getUTCFullYear();

    // Update markers
    reports.forEach(function(report) {
        let marker = L.circleMarker([report.latitude, report.longitude], {
            radius: 4,
            stroke: false,
            fill: true,
            fillColor: '#d7ba7d',
            fillOpacity: 0.3,
            interactive: false
        });
        marker.addTo(self._reportsLayer);
        self._markersData.push({ marker: marker, report: report });
        self._markersQuadTree.add({ marker: marker, report: report });
    });
};

MapRenderer.prototype.handleCurrentReportChange = function(event) {
    let report = event.detail.value;

    // Remove any existing markers
    if (this._currentReportMarker != null) {
        this._map.removeLayer(this._currentReportMarker);
    }

    // Add current report marker
    let reportMarker = L.ExtraMarkers.icon({
        innerHTML: '<img src="' + UFO_SHAPE_ICONS[report.ufo_shape].src + '" width="20px" height="20px" style="transform:translateY(5px);filter:invert(1);"/>',
        markerColor: 'pink',
        shape: 'square'
    });

    this._currentReportMarker = L.marker([report.latitude, report.longitude], {
        interactive: false,
        icon: reportMarker
    });
    this._currentReportMarker.addTo(this._map);
};

// ==================================================

function ReportPanelRenderer() {
    this._reports = [];
    this._currReportInd = 0;
}

ReportPanelRenderer.prototype.handleMapSelectionChange = function(event) {
    this._reports = event.detail.value;
    this.setCurrentReport(0);
};

ReportPanelRenderer.prototype.render = function(container) {
    let self = this;
    let backBtn = container.querySelector('.detail-control-btn-back');
    let forwardBtn = container.querySelector('.detail-control-btn-forward');

    if (this._container != container) {
        let closeBtn = container.querySelector('.detail-close-btn');
        closeBtn.addEventListener('click', function() {
            let panelCloseEvent = new CustomEvent('panelClose', {
                bubbles: true,
                detail: null
            });
        
            container.dispatchEvent(panelCloseEvent);
        });
        backBtn.addEventListener('click', function() {
            self.setCurrentReport(self._currReportInd - 1);
        });
        forwardBtn.addEventListener('click', function() {
            self.setCurrentReport(self._currReportInd + 1);
        });

        this._container = container;
        return;
    }

    if (this._reports.length === 1) {
        forwardBtn.disabled = true;
        backBtn.disabled = true;
    } else {
        forwardBtn.disabled = false;
        backBtn.disabled = false;

        if (this._currReportInd === this._reports.length - 1) {
            forwardBtn.disabled = true;
        }
        if (this._currReportInd === 0) {
            backBtn.disabled = true;
        }
    }

    let report = this._reports[this._currReportInd];
    let location = this._container.querySelector('.detail-location');
    let date = this._container.querySelector('.detail-date');
    let duration = this._container.querySelector('.detail-duration');
    let description = this._container.querySelector('.detail-description');
    let shape = this._container.querySelector('.detail-shape');
    let iconAttribution = this._container.querySelector('.detail-icon-attribution');
    let count = this._container.querySelector('.detail-control-count');

    location.innerHTML = this._formatLocation(report);
    date.innerHTML = report.datetime.toUTCString();
    duration.innerHTML = 'Duration: ' + report.duration_described;
    description.innerHTML = report.description;
    shape.innerHTML = 'UFO Shape: ' + report.ufo_shape.charAt(0).toUpperCase() + report.ufo_shape.slice(1);
    count.innerHTML = (this._currReportInd + 1) + ' of ' + this._reports.length;
    iconAttribution.innerHTML = UFO_SHAPE_ICONS[report.ufo_shape].credit;
    
    return Promise.resolve();
};

ReportPanelRenderer.prototype._formatLocation = function(report) {
    let titleCase = function(s) {
        s = s.toLowerCase();
        s = s.split(' ');
        for (let i = 0; i < s.length; i++) {
            s[i] = s[i].charAt(0).toUpperCase() + s[i].slice(1);
        }
        return s.join(' ');
    };

    let upperCase = function(s) {
        return s.toUpperCase();
    }

    let extractLocationParts = function(s, formatFunc) {
        s = s.split('(');
        return s.map(function(p) {
            return formatFunc(p.trim().replace(')', ''));
        });
    };

    let parts = extractLocationParts(report.city, titleCase);
    if (report.state_province != null && report.state_province != '') {
        parts = parts.concat(extractLocationParts(report.state_province, upperCase));
    }
    // if (report.country != null) {
    //     if (report.country === 'us') {
    //         parts.push('US');
    //     } else if (report.country != '') {
    //         parts = parts.concat(extractLocationParts(report.country, titleCase));
    //     }
    // }

    return parts.join(', ');
};

ReportPanelRenderer.prototype.setCurrentReport = function(i) {
    if (this._reports.length == 0 || i < 0 || i > this._reports.length - 1) {
        return;
    }

    this._currReportInd = i;

    let currentReportChangeEvent = new CustomEvent('currentReportChange', {
        bubbles: true,
        detail: {
            ind: this._currReportInd,
            value: this._reports[this._currReportInd]
        }
    });

    this._container.dispatchEvent(currentReportChangeEvent);

    this.render(this._container);
};

// ==================================================

function TimelineRenderer(dataManager) {
    this._dataManager = dataManager;
    this._intervalsPerSecond = 24;

    let data = this._dataManager.getData();
    this._timeInterval = 1000 * 60 * 60 * 24 * 30; // month
    this._startDate = this._getSnapToInterval(data[0].datetime, 'ceil');
    this._endDate = this._getSnapToInterval(data[data.length - 1].datetime, 'floor');
    this._currentDate = this._startDate;
}

TimelineRenderer.prototype._renderChart = function(container) {
    if (this._container == container) {
        this._svg.remove();
        this._verticalSeekLine = null;
        this._rangeSeekIndicator = null;
    }

    this._container = container;

    let dayData = this._dataManager.getDayData();

    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    this._xScale = d3.scaleTime()
        .domain(d3.extent(dayData, d => d.date))
        .range([0, containerWidth])
        .clamp(true);

    this._yScale = d3.scaleLinear()
        .domain([0, d3.max(dayData, d => d.reports.length)])
        .range([containerHeight, 0]);
    
    this._svg = d3.select(container)
        .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    let chartG = this._svg.append('g');

    let line = d3.line()
        .x(d => this._xScale(d.date))
        .y(d => this._yScale(d.reports.length));
    
    chartG.append('path')
        .attr('class', 'timeline-chart-line')
        .attr('d', line(dayData));

    let timeAxisG = chartG.append('g');
    let reportAxisG = chartG.append('g');

    let timeAxis = d3.axisBottom(this._xScale).ticks(10);
    let reportAxis = d3.axisRight(this._yScale).ticks(2).tickFormat("");
    timeAxisG.attr('class', 'timeline-chart-axis')
        .call(timeAxis);
    reportAxisG.attr('class', 'timeline-chart-axis')
        .call(reportAxis);

    this._svg.append('text')
        .attr('x', 9)
        .attr('y', containerHeight / 2)
        .attr('dy', '0.32em')
        .attr('class', 'timeline-chart-axis-label')
        .text('100');

    this._svg.append('text')
        .attr('x', 50)
        .attr('y', containerHeight - 5)
        .attr('alignment-baseline', 'baseline')
        .text('Number of Reports by Day')
        .attr('class', 'timeline-desc-text');

    this._selectionIndicatorsG = this._svg.append('g');
};

TimelineRenderer.prototype._renderPlayer = function() {
    let self = this;

    this._controlBtn = this._container.querySelector('.timeline-control-btn');
    this._controlBtnIcon = this._container.querySelector('.timeline-control-icon');

    this._controlBtn.addEventListener('click', function() {
        if (self._playInterval) {
            self.stop();
        } else {
            self.play();
        }
    });
};

TimelineRenderer.prototype._renderTooltip = function(date) {
    let xPos = this._xScale(date);

    let year = date.getUTCFullYear();
    let yearMap = this._dataManager.getYearMap();
    let containerWidth = this._container.clientWidth;

    let seekTooltip = this._container.querySelector('.seek-tooltip');
    if (seekTooltip.classList.contains('invisible')) {
        seekTooltip.classList.remove('invisible');
        seekTooltip.classList.add('visible');
    }

    let seekTooltipContent = this._container.querySelector('.seek-tooltip .tooltip-content-container');
    let seekTooltipArrow = this._container.querySelector('.seek-tooltip .tooltip-arrow-bottom');
    let seekTooltipl1 = this._container.querySelector('.seek-tooltip-l1');
    let seekTooltipl2 = this._container.querySelector('.seek-tooltip-l2');
    // let seekTooltipl3 = this._container.querySelector('.seek-tooltip-l3');
    seekTooltipl1.innerHTML = 'Year: ' + year;
    seekTooltipl2.innerHTML = 'Reports: ' + this._dataManager.getReports(new Date(year, 0), yearMap).length;
    // seekTooltipl3.innerHTML = 'Since ' + this._startDate.getUTCFullYear() + ': ' + this._dataManager.getReportsInRange(this._startDate, date).length;

    // CUMULATIVE REPORTS?

    let tooltipHalfWidth = seekTooltipContent.clientWidth / 2;
    if (xPos < tooltipHalfWidth) {
        seekTooltipContent.style.left = '0px';
    } else if (xPos > containerWidth - tooltipHalfWidth) {
        seekTooltipContent.style.left = (containerWidth - seekTooltipContent.clientWidth) + 'px'
    } else {
        seekTooltipContent.style.left = (xPos - tooltipHalfWidth) + 'px';
    }
    seekTooltipArrow.style.left = (xPos - 8) + 'px';
};

TimelineRenderer.prototype._renderTimeIndicator = function(date) {
    if (!this._rangeSeekIndicator) {
        let containerHeight = this._container.clientHeight;

        this._rangeSeekIndicator = this._svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._xScale(new Date('Dec 31, 2000')) - this._xScale(new Date('Jan 01, 2000')))
            .attr('height', containerHeight)
            .attr('class', 'timeline-chart-seekrange');
    }
    if (!this._verticalSeekLine) {
        let containerHeight = this._container.clientHeight;
        
        this._verticalSeekLine = this._svg.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', containerHeight)
            .attr('class', 'timeline-chart-seekline');
    }

    let xYearPos = this._xScale(new Date('Jan 01,' + date.getUTCFullYear()));
    this._rangeSeekIndicator.attr('x', xYearPos);

    let xPos = this._xScale(date);
    this._verticalSeekLine.attr("x1", xPos)
        .attr('x2', xPos);

    this._renderTooltip(date);
};

TimelineRenderer.prototype._getSnapToInterval = function(date, direction) {
    // let dayStartTime = new Date(date.getUTCFullYear() + '-' + date.getUTCMonth() + '-' + date.getUTCDate()).getTime();
    let dayStartTime = new Date(date.toDateString()).getTime();
    if (direction === 'floor' || date.getTime() === dayStartTime) {
        return new Date(dayStartTime);
    }
    return new Date(dayStartTime + this._timeInterval);
}

TimelineRenderer.prototype.setCurrentDate = function(date, forceFireEvent) {
    let self = this;
    let prevDate = this._currentDate;
    let clipped = false;

    if (date.getTime() < this._startDate.getTime()) {
        this._currentDate = this._startDate;
        clipped = true;
    } else if (date.getTime() > this._endDate.getTime()) {
        this._currentDate = this._endDate;
        clipped = true;
    } else {
        this._currentDate = this._getSnapToInterval(date, 'ceil');
    }

    if (prevDate == this._currentDate) {
        return clipped;
    }

    this._renderTimeIndicator(this._currentDate);

    let shouldFireEvent = prevDate.getUTCFullYear() != this._currentDate.getUTCFullYear();

    if (forceFireEvent || shouldFireEvent) {
        let currentDateChangeEvent = new CustomEvent('currentDateChange', {
            bubbles: true,
            detail: {
                overallStart: self._startDate,
                previousValue: prevDate,
                value: self._currentDate
            }
        });
    
        this._container.dispatchEvent(currentDateChangeEvent);
    }

    return clipped;
};

TimelineRenderer.prototype.setToEndDate = function() {
    this.setCurrentDate(this._endDate, true);
};

TimelineRenderer.prototype.handleMapSelectionChange = function(event) {
    this._lastSelectedReports = event.detail.value;
    this._renderSelectionLines(this._lastSelectedReports);    
};

TimelineRenderer.prototype.handleDeselection = function(event) {
    this._selectionIndicatorsG.selectAll("line").remove();
    this._selectionLines = {};
    this._lastSelectedReports = [];
};

TimelineRenderer.prototype.handleCurrentReportChange = function(event) {
    if (this._lastSelectedReports == null || this._lastSelectedReports.length == 0) {
        return;
    }

    this._selectionIndicatorsG.selectAll("line")
        .classed('selected', false);

    let line = this._selectionLines[event.detail.ind];
    line.classed('selected', true);
};

TimelineRenderer.prototype._renderSelectionLines = function(reports) {
    if (reports == null) {
        return;
    }
    
    let self = this;
    let containerHeight = this._container.clientHeight;

    // clear any existing lines
    this._selectionIndicatorsG.selectAll("line").remove();
    this._selectionLines = {};
    
    reports.forEach(function(report, i) {
        let xPos = self._xScale(report.datetime);
        let verticalLine = self._selectionIndicatorsG.append('line')
            .attr('x1', xPos)
            .attr('y1', 0)
            .attr('x2', xPos)
            .attr('y2', containerHeight)
            .attr('class', 'timeline-chart-selectionline');
        
        self._selectionLines[i] = verticalLine;
    });

    if (reports.length > 0) {
        this._selectionLines[0].classed('selected', true);
    }
};

TimelineRenderer.prototype.play = function() {
    let self = this;

    this._controlBtnIcon.classList.remove('fa-play');
    this._controlBtnIcon.classList.add('fa-pause');

    if (this._currentDate.getTime() == this._endDate.getTime()) {
        this._currentDate = this._startDate;
    }

    let timelinePlayEvent = new CustomEvent('timelinePlayEvent', {
        bubbles: true,
        detail: null
    });

    this._container.dispatchEvent(timelinePlayEvent);

    // this._playInterval = requestInterval(function() {
    this._playInterval = setInterval(function() {
        let clipped = self.setCurrentDate(new Date(self._currentDate.getTime() + self._timeInterval));
        if (clipped) {
            self.stop();
        }
    }, 1000 / this._intervalsPerSecond);
};

TimelineRenderer.prototype.stop = function() {
    this._controlBtnIcon.classList.remove('fa-pause');
    this._controlBtnIcon.classList.add('fa-play');

    if (this._playInterval != null) {
        // clearRequestInterval(this._playInterval);
        clearInterval(this._playInterval);

        let timelineStopEvent = new CustomEvent('timelineStopEvent', {
            bubbles: true,
            detail: null
        });
    
        this._container.dispatchEvent(timelineStopEvent);
    }
    this._playInterval = null;
};

TimelineRenderer.prototype.render = function(container) {
    let self = this;

    this._renderChart(container);
    this._renderPlayer();

    // On window resize, rerender the svgs
    window.addEventListener('resize', function() {
        self._renderChart(container);
        self.setCurrentDate(self._currentDate);
        self._renderSelectionLines(self._lastSelectedReports);
    });

    return Promise.resolve();
};

// ==================================================

function VisualizationManager(dataManager) {
    this._dataManager = dataManager;
    this._mapRenderer = new MapRenderer(dataManager);
    this._reportPanelRenderer = new ReportPanelRenderer();
    this._timelineRenderer = new TimelineRenderer(dataManager);
}

VisualizationManager.prototype.render = function(container, mapContainer, timelineContainer) {
    let self = this;
    this._container = container;
    let reportPanelContainer = mapContainer.querySelector('.map-side-panel');

    this._renderPromise = Promise.all([
        this._mapRenderer.render(mapContainer),
        this._reportPanelRenderer.render(reportPanelContainer),
        this._timelineRenderer.render(timelineContainer)
    ]).then(function() {
        self._timelineRenderer.setToEndDate();
    });

    timelineContainer.addEventListener('currentDateChange', this._mapRenderer.handleCurrentDateChange.bind(this._mapRenderer));
    timelineContainer.addEventListener('timelinePlayEvent', this._mapRenderer.disableSelection.bind(this._mapRenderer));
    timelineContainer.addEventListener('timelineStopEvent', this._mapRenderer.enableSelection.bind(this._mapRenderer));

    mapContainer.addEventListener('selectionChange', this._reportPanelRenderer.handleMapSelectionChange.bind(this._reportPanelRenderer));
    mapContainer.addEventListener('selectionChange', this._timelineRenderer.handleMapSelectionChange.bind(this._timelineRenderer));
    mapContainer.addEventListener('deselection', this._timelineRenderer.handleDeselection.bind(this._timelineRenderer));

    reportPanelContainer.addEventListener('currentReportChange', this._mapRenderer.handleCurrentReportChange.bind(this._mapRenderer));
    reportPanelContainer.addEventListener('currentReportChange', this._timelineRenderer.handleCurrentReportChange.bind(this._timelineRenderer));
    reportPanelContainer.addEventListener('panelClose', this._mapRenderer._deSelectRadiusMarkers.bind(this._mapRenderer));
    reportPanelContainer.addEventListener('panelClose', this._timelineRenderer.handleDeselection.bind(this._timelineRenderer));
    // timelineContainer.addEventListener('currentDateChange', function (event) {
    //     let mapDrawUpdate = function () {
    //         self._mapRenderer.handleCurrentDateChange.bind(self._mapRenderer)(event);
    //     };
    //     window.requestAnimationFrame(mapDrawUpdate);
    // });

    return this._renderPromise;
};

VisualizationManager.prototype.show = function() {
    var whenReadyResolve;
    let whenReadyPromise = new Promise(function(resolve, _) {
        whenReadyResolve = resolve;
    });

    let vizContainer = this._container;
    vizContainer.addEventListener('transitionend', whenReadyResolve);

    // Make sure show only happens after render complete
    return this._renderPromise.then(function() {
        vizContainer.classList.remove('invisible');
        vizContainer.classList.add('visible');
        return whenReadyPromise;
    });
};

VisualizationManager.prototype.play = function() {
    this._timelineRenderer.play();
}

// ==================================================

async function render() {
    let dataManager = new DataManager(DATA_PATH);
    let loadingRenderer = new LoadingRenderer(dataManager);

    // Show loading screen
    let loadingContainer = document.querySelector('.loading-container');
    loadingRenderer.render(loadingContainer);

    // Fetch and process data
    await dataManager.loadAndProcessData();

    // Render visualization behind loading screen
    let vizContainer = document.querySelector('.viz-container');
    let mapContainer = document.querySelector('.map-container');
    let timelineContainer = document.querySelector('.timeline-container');
    let vizManager = new VisualizationManager(dataManager);
    await vizManager.render(vizContainer, mapContainer, timelineContainer);

    // Fade out/remove loading screen and fade in visualization
    await loadingRenderer.remove();
    await vizManager.show();


    // Start playing the map through time
    // vizManager.play();
}


// ========== Main ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}