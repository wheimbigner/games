import React from 'react';
export default function(props) {return(
    <table style={{ borderSpacing: 0 }}>
        <tbody>
            <tr>
                <td style={{ marginRight: 10 }}>
                    {props.title}
                </td>
                {Array(5 - props.data.slots).fill(0).map((el, key) => {
                    return (<td key={'spacer' + key} style={{ width: 20, height: 10 }}/>)
                }) }
                {Array(props.data.wounded).fill(0).map((el, key) => {
                    return (<td key={'hit' + key} style={{
                        width: 20, height: 10,
                        background: 'linear-gradient(to bottom, #e04e4e 0%,#990000 50%,#e04e4e 100%)'
                    }} />)
                }) }
                {((props.data.slots - props.data.wounded) > 0) ?
                    Array(props.data.slots - props.data.wounded).fill(0).map((el, key) => {
                        return (<td key={'miss' + key} style={{
                            width: 20, height: 10,
                            background: 'linear-gradient(to bottom, #8ee24d 0%,#029900 50%,#8ee24d 100%)'
                        }} />)
                    })
                    :
                    null
                }
            </tr>
        </tbody>
    </table>
)}