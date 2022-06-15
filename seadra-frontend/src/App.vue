<template>
  <v-app id="app">
    <v-navigation-drawer
        absolute
        mini-variant
      ><img style='width:100%;margin-top:20px' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtSJVQSuIOGSoThZEpThqFYpQIdQKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APE0clJ0UVK/F9SaBHrwXE/3t173L0DhGqRaVbbOKDptpmMx8R0ZkUMvKIDPRhAFH0ys4xZSUqg5fi6h4+vdxGe1frcn6NbzVoM8InEM8wwbeJ14uimbXDeJw6xgqwSnxOPmXRB4keuKx6/cc67LPDMkJlKzhGHiMV8EytNzAqmRjxFHFY1nfKFtMcq5y3OWrHM6vfkLwxm9eUlrtMcRhwLWIQEEQrK2EARNiK06qRYSNJ+rIV/yPVL5FLItQFGjnmUoEF2/eB/8LtbKzc54SUFY0D7i+N8jACBXaBWcZzvY8epnQD+Z+BKb/hLVWD6k/RKQwsfAb3bwMV1Q1P2gMsdYPDJkE3Zlfw0hVwOeD+jb8oA/bdA16rXW30fpw9AirpK3AAHh8BonrLXWry7s7m3f8/U+/sBiZ5ysNGsnWEAAAAGYktHRAAnAJ4Ad7NOOQ4AAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmBg4VORhkU6TbAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAHnBJREFUeNrtnHl8XMWV779V997u23u3dsnavFvewWCDzRoCE0gwBMhgwMlAGAJhIBDgsSST9SWEAMlAmJkkvEDYhx0ChB1jzGIwXjDebSTZlmRLlmSp1a3uvlvV+0OYAd7kfWaJie2Z33/d996q6u+n6pxT59Rt+B/9lyT+PTe92fpCZcl0U8c1nfzBf6aTu5f/anbPwNbDc3mvxTWcaUMq2+gND6MR2FaaZDjVFjPsl0eVNd5z3txvbTugAD637ffj3lu3aJMyBmWExg1hs/IH9XWjnj2l5YLhf+v+B5f/IlMo+Yf2De04rN/Lzw0r43OBNvowjDf8ILtiXGZy4Ob8dh21R+8cbI8JwztioDg4d0DnohGiusYedc/o9ISr//a4S3cdEAAf33zn2LVtL30gI4OUigI/CDCCVClupTYPO73v20YcRzmYMlHr+v7EiGnXBypYixF5LRMvWxYzap8//8hv/n9hPL3l4eiaTcvP6yns/EmP25PO6Kq+ccmJZ1x5yvdeOyCW8P2v/2zhrkLnd3cXu5sCGUSUlmgtAynsQkSGPzCt+MaQEVmTSZYvq0rWLTm55RzvPzOYR99/oGrFptef2OpumhtX1f746vHnXX3Cj+/b7wHuUV73h5a2/bEZX9NUOyE7IXl4j9alcFduY0V9cmbXn2NAj628N7rkgyWt3d72mmQQV1NqD/3ry4+/9rEDAiBAV7BGvLj0yW/3DHd/I+d3NhV81zCVaQRKualwhRAitNrQ0WUVsdp3a8sbn5o//ezB/2gfP3702/9rU3HtjZ5QmH75wKhQzVE3nf2rtQDPvPJ405jDm7ZPjs7S+yXAe5fetHB7fsm9JV0gTEqbqnKxQeKJ+pqa0o5dXWXZ4sCVu9XWSu3bxK0y4iKzJKTjv2maNOqPCyZ9a+jf08f3H/7mWWudtgcGlUVPboAjUhP7544+7Ki/OeIb6295/MZTur1d59ZUj/va5cdclNvvAN792v++tnX3e9dHI1Xr69ONFyw87LqlH7/+68U/OG19/5uPKSHQWgEStCQqM05SJJ9KJhofbawY9dRpM88r/ak+rn7i8j8u7tt40oaiRitJvamYl67tG5NpuCyRSNW80rroF2Uq/k5drPHzP11wc36/AgiwtmfRuKnVn/t/YsL7Vt48bkffluc6hreNAxelTDQajUJpA6ED8loTF3WkQvaqQIllERKbh1SuF1WiKpoeHQqrU5yg82BHakzLBDSBryi6kCv5tGcFKwZKjImEmJoY9e6RY+Ydc97ccwv7FcCP664XfjZnl972bbQ7S6pYbVbtjmaDHoEy0DpACYECAiRCmbSXNKuGFGGpaLYUY1MwPmVTYdvEwhJpOigtGChJIpaLUCFypRLxuI3juVihEPmSx+adJit35Ti68uB/ufkrN579lwIo/8sN2OGM4zt21K6/df5xF6an1x/dmJY1vYfWf54qezSg6C8JNvZLVmY91uVLzIhqFjRZnDUtxXFjU9SWmfSXenEsh7yvQAsC5eIID2lqTBtcr4glgEARC1scOqbIwlkZ8kHrmT976rtf3G9n4Ke1ZuDl5Durl7y/8Igrm5ZsepaHN93BW/0hcrrE4ckQB9cmqUoFGEqTdVw8X1EdD+Fr6Mt7dA85TK+P4Tqwfcigrb/AYAECpQlZkqqEZlTKoCpmY1tFCsLEHxzVWWPMbFpw9IVqvwD4/Jo7Mvkge0T7jo3hkupDah+MOHGrclzRc76209nWMrpsJu/v2siGgSLRqOCv6mNUJDUDxRJOKaA5HaEz51D0AmozUQhcIqbEVQZ5R7G4M2BNu0MyrsjEw2ghKJY8tu4W1McUBzeGmVJpErMVrg4xKjT7yvkzrvnlPg1w2dpnQ+/3L3mw1+2YP1jqNqJmipDMbPI8fzAwSjPyXr8doOgvhuh2oMcNOKYmypRRJn39w6RiFsOOz6ATMKkyhhSKQFt0DeQZdl0m1ZYxXPR4ekOJgZzkS9M8qtMmIekhtU3JC9GWLfJml6Zrh+DYqYKZ1SYhAyxRVhiXPHbaEePPbfssAZr/oSDa2XJKZ37tl+2oZHxi1sPj62ddcvS4M3sBXm29p3LZpteWHjfjrLE/WHwDu12LU8cnGBVxyQ4FJGJhbFOTCNvUCUEQaNr7szRXV1ITtygFYUylWdZVxHEklx5tkAyXaBtIsKLD4+ovfIsaK8WbHQ9QlljPc77Jhk6DUfEC9YkUru6PdmXfvxeYt886kd6d7uPjkoec32AeftzfHnPjmXvgARwz5qh+ETZ3vrThRbIFg1MnRqmwSgSYmIYkE9ZYhoEUmiDwMaWmOlXBzt3DaEwqYga9bsCKnQFnzTKoCXus6Y5yyyu7uWeNZvX2An2+YE2nSZOtOGq8Zutgjr6igRISITRDwda5T773nYv3Gyfy7bs/LybWHX6BLwe/mPcL83pLO8uXDhaY15BgatKgr+AQi0axRYAhNBt2lUiGNKlknKgpaO/LM+AE2EIxcVSarn6PpZs9rvqcSclVXL/YYG1WYQgDGWgspfFFkZ+faGGZLrcuDjOlKeCw+jiGdFHaIkLKqY0dNu34yRdt2efDmGnNh1/RGrz+245i23xfe+Uf5As0WVHGp216h4qUR8LYBAzmSxR9SMciJOwQBA6WEhTdAIWB6xsELvieoKFMETM1RRmhI5+nPAnJeEA4HuDZigCBVhYRW5MIB0gEggCNRODiqMFwtrjxqeXdD0b3ORv4aSWsTF9NYdbv6uvq747GY7k1fX94r6XeItCKdDJCyffxtSadsElJk+a4wLSgbQAUAXVJm0HHJyZMYiGIhTVF18ISEWpMj2lVaYy4T7Vp0LbbpNNXxL2A8qiLVGlKapBYOIo0JIqRCCYwoKPUPqlrXfi+bfl3zmyKz/H2WYBfmXvF3cDdAL9ccs0tQ7pERdRkcGiYmmQYLANbSUbHbGKWj6EsAmEirCECbVIdNahIhLEVlJCUxzx2FhyGvQSNdoizZuZ4do1P4+gEgVXA7Qs4dpxJZShgawFKSlJuC9ABQoBUEoTBoDvEQGHll59aIR5Yuvvhrx5e9telvQXQ+HM0cuerP7xg9cCqn2oRpqncIBMWDLsax/WZWBYhbQKEELLcN4zyYLhoiEGvJGwJvUWHrUNFQJKybQwRsHWXz5TGKJNjYUbVJejryxK4gjm1mqMbDZQ0WLzFwzAlkyotTEMjEKANED4lV5ILAgbcnZN39wye/LWLT3vjiTsW7drnZuAeubL49ZQlKSgf7Sk8Q2OYMZJhh4QZQogIUWvmwon1xz0ixCS3zXu5cvPmd76+u7TyhlxJ0u8KPL9IZUQyqdrijTafp9cFLJxiMCMTomVGhmHPIdCKkuvwfq/JGzsdThiniViSQEuE8NFCIwFLakyl0cJgp9c2Y2BgcM3Pn7voD5Pqm59KmjWLjm05d+u/9Tu01vLF9XeOdr1C6eSZl3btdS+8R0s2P1S5bajjC89vX3zPkaNMTKnozRUYVxZjTMImao1f0dL4k0M+/sywXmG9svqhrR3u+rqt3cPUpaNUxsOAwlWa1Z0evmswf2KMxooQJgGDjuad7QUe2FJiTp3BxMowKB8lNKYBWksEGleYdPbnKfoaDQitqE6EiFthTCKUXJF1nXRX3ulvNaUgETVFJlE5J+f22AovoXVIV4XH3z1n6tzLx0dOyH4me+H73785vah16cCMGkXIBK0VCakZWxYlKpo6Wprnjw2JeZ8w6Es23XpyV37lU0VyhISmY9AhZRskIya+NujLuWzuU+zMeQjADQTJqGRClaA5KVGBQBsCQ4DSI7BcLdidd8gWXXxMNIK4BTXJEFL7BAjyvkH3kItAIIWiOm5gmQKNRCNA+2jpUSPnLDpl9sLjM6JF7bVszB6lRYaUTJIvlsgrD0PBkA+9eRdHb21o71hx1aefOWriZU9X2pNus5EoAvqLPsOuAqXxXJfqhMG80RYnt9h8fkKYE1ssjh0naUiGUYHGESAQCA2gAUWu6NJfDHCx0EKg9ciVQAsUEo1FLu8g0Rg6QGoPgYHWmpHWRvx5IAwKxd3T3t24NP6ZZWPuWHLjN6L28Ogh1XaNNrKi5AtMPEYno1SGE8Sslnuq01Ovqkid9NEOpqTXma++/4df7A5WfsvRAVIIHM/jg94802pTDCsNgcY2oeSDJU0crVC+SzQkGcl8C7RQFH2DHdkCJU8TIkRUJku2FRsUSm5OJ/yeRMhGYbC1r1dErapDsqW+yqLuj1WmbRAukjACDx9Bymh8b1zqkDOObzm/9TNNZwE8u+6GSzqHlt0WCI/ufImqdJxRNlTbUaJGxhFi9I/Skcm3N1af2L/nmdc23HJRf2nLz/N0JRVQ1IKYMhl2HXytiIZDuL6PZSi0lGhtILRAiACtBIbK0D8k10ojuSRipd6qTlaumDxm8o6W5LF/sg6zMvtMbNmqFQeHw9nLskHb6Y5RAi0Jq0zQHDn49FNnXfmHzzwfuEcPrfj+w/3Bmq8INL3ZHLZh0lgeoypqERU+pqhUpqh5MBlveLChctJzlpjnt2afT7V2rLiy6O06p+D3jXFFAXBQwkJoECg8TKQGU0eVbSa6bJl62xDpJ0bXH/Li5PLj+/+z431k1Y0LuvPv3RazRq2tjjd/54tT/27pXyShukf/uOj7p7UOv/NYfYWNgSRqBXQMeIzOGNTaJsmwhaE1SpsYVs1OU2TuSURr7p1QfeE6gGVb7xqbdQbnZPOdsahd3SKEtgJV3Fl0stvqyycNRMyqlTPrT+3e76py/17900tXnb6msPzRLbtN5jQmqI15RIUm75vYRkDUklRFwkRNjUQCDhDGkk0bTJH+bVliyiPNVafuYB+X3FsNh8iMias4h9U0tPbtVsPvdJj0OwaWZRJowfbBIl0Fj+68x3Dg4wuTQAc4/raWvL/ylo6BJ7e+s+Xa51a2XT9fay33VYB7bQbe9vR1nw9n7C8eM+/4K9q2tDa/su7F917r60ge3pRkfNJAag8zZFEoOMRtm7ipSdkQNTQCRjyrHtksmbJmhx2u+G1FfMqvm8vP6P1vAXD52tdNE1vPnHpoAHDtHxbc3lYcvGCgaGCHNLObbNJmnpCRolTKErbjCOGTkIJ0GCKmRGhQgMZHa4OwbFQRo/LW6rIJP2koO3P3AQ3w0/rRk3/3Qq9af4KrDTYPmfQ4AX81PsHkWAHXsLGEpmdggOp0GQpB0vBJhQVhw8DQEq0VSrrIwMKSVcV4pOnnzXWfu74sdLh3QNrATysZjn4ggySWshiXMGlJCxZtybOkJ4wKFEGgSacy+L5ie08f2cBgZ0Gzs+iRVyOJV61MlFQ4ujvSP7zyh+vaHn9vY/fvZ/+3AHjiUX99ycymo49NWqmec2ZcQLkMmFQmeGF7kdfaXTxMhAoQUlJbnqbkadp68/SVQvQMCwYdB1CgQQtQskRBbZ7cNbD09bc333z6AQ9wUuxQ/fXZVyxOhlI9nUMdgInnKQQWi/olS7a6CGlSKA4TMgQIkBKkdlD49HnQXVT4jDgXoUzAwNHdoSF/2aPvbLnpygPaBgLctfQfzli+85VH3MBBI3CQdOR92kqSId/grNEhplYpHF9jGRJDaHwNBccjGglhKpeEaZKJGlhKoYUi0CGEBolNReywi2eNvuzXBxzAZ1ffNWZd15qLdxTaLx/WQwbaQBMwMTmLg0cfzYPv3c2qoSF2eD7fnJEkrItETYEQggCJ5wcgQGlB2DSpDAekwgKUCcJD65EzYJauKDRUHndYS/XX1nxWAI291fCm4lJz5gmNC2d/ZcptG3tW3yhDUdKRittCxcQdVYkGJx/kpp8w4XQOn3AMxVyOHblNrC9IMloxutzE1wGDw5poCKQRoqs/z1DJpyxiUFCaqGViCg+t5UcpKyUcK/D9g35/21t3fFYAzb3R6BPLf1355OKHXt1eWj/FROsxsVkXXnbiDf/nY7c8/IPnL9mxcuc7V4djcZbtWEzEcqkzI7zc6zCzKYmtSxjCQAmNxqciEUEjCISB0IpsySNsGyNO5cPFpPHJFXfMWbfjrkOn1J377n7rRLZ2f/CDrLV+SkQoxsTm/fpT8FjduyguYPLqnuXc+8ZNnDrrq0RlGYbpUAoM+rIBhmESDocYKgagIBoShE1B71ABHQiGPB9fSbTW/2qHtCQwcmLH4KoT92svrIzwLiNX21sbmXnzZSf88O8+fu3mxd856YE37tvcNdh2UkNkVFbIiNc/2I8KhhgTMwkRMJDX+FpScBwGcw5KCdCKQCuUCtBa42NQ9DQIRpbwyL4PhUAIceIB5UT26Jm1DzY+t/7RNqEpjquYcfblx33v6buW3tKwoav1xR3BuknaN1k7LBmbkBzdrHAUeL5BNCSQOsAXFoEYMdxSazIWlNv/Cg8BSgisIP3eSdPvPeiAigMBwtGwU6Grc1OqZs2//LjvPQ1w7uGXd4ytHX+RcEPkMel2BT4SX4TwAwPPCfC1IBAmQ0WXzv4iXX05fKUIVDDCTYzMA61B6QDTiFfu107kT+n4MV/uATKf/j5qWtlASrqzAYOYxAyBH0BPzkEryXBQpDIZQUoJaISUKCHRQo3YwA8BCjRoiadyvQccwJfbHwq9veJdqirqjK7ubaq2skHPmn6Y2ti+Nrmha93tkgAMifQCqpMm2vfRWoJQKKXQKiAaMjAESMPE0D6GlCPLFg18WAMGIlZZ8YAA+Pjye8au3b7qHNcozF/0/gsHZ50hsa1zC8r06O/rpXXJB0M5byCSCwYtXxh0+AaTIyWq0wLTVyTtEVjRkIUhIVcK8H2PeCyC0AFh00B/eKhIf+iFpXAhiDy13wO89cXvX7Zk6x9/4Vl9RtirHqyyG38yccL0ZfnBYbt9sPVnPcG2cVmnL6kRKGHywVCRgm9y5PgIli4RCIN0dCTuG6mdCHJFB18DFKmNGdjGiAve886XFmCpKq+24qCH9muAL214pOGVTffdEo+XkMPjXp7QMG3BwjmXfFQxu/Lx88+QXmicJ31QkjywwQ3x5VEWdbGAvlxAyQ+oTUi0YaD0yAK1QxZ5xyMWNimLWJg6QIkPyX0YUScjYx5oGbWgff+egZZwI6KpNRJYb0+fMvu8L0w60wN4vv3J1PKNS77fOth6pg8oJLsLBh+4DseVGUyplSit8AJABRQDSUT6lHwYKrikozZJ26TaVkRNNXLSQHsIbYCWJM1JrY01c644ILMxP3ziit8OOX1fNc3IbykazxbDuV/uLPZNfSprMjft8YUxEicw0NrFtkZmnSFHZlbBU+SGHcrjNnW2JBM1kPgEKLQ2kDogLJvbq5Ozjjy48YKuzxLgZ+aFoyLWU5asXPitk657HOBHT13+4Mp8z08OTyhOGB0iELB7OIsRGNhlNoYUOJ6m5I44jVjKoDysyYQFQgdoLZCYaG2SMCevaKiedcqEigWfKbzPfCcC8NrWP0SWrVv55Q259t+tH+6KnDAxQlgaSKVwXB9PaOIhA4lmuKQY9nwqEyFqbE0mJD8MVzSoEJZO60x0/D/XV0+/qjE1v8RfQHsd4DPvPZ5a2fbuiSUze7zhydn9bn/TB2420e8oTpwUISGL7Mr7WFKRjtkgBJ6nyDk+iViUsHaojoVJmQD+SCAdhIlZo1ZUpWdcMX3UBUv4C2qvAXyp9fHoqnXLb+oqbf9mSRVVSBjubjUU2elotg5pTptuU0EJx4gS+Dm0sLBNiUDiBQGDJY+aWIimuCBqKEChtMQ2GnckQuO/O2/8VXexD2iv2cDla96+al1x9cUxneqd3XTkl1omNLf+fvH9HbsGByMnTAxTZir68gqth8kkbUBRKvkMO5pMIsSopKQuJokgQEls2Vy0rfrvNdZM+6fmzEkl9hHtNYAxq+ytZjXx+Yyovvr8eZevuXvpb1p6ip7VXBamNuGjlEQaAiFAoRBagxCYhiAmfUbFLGw0pq700/aEX6cTDddMqVtYZB/TZ+JEbnjh+tkd2Y6HFg9saD5tYhpD+xS8EtFoBEmARFHwFCErREa61CZD2IFNyhz7bDI29eKDmr+6z/6b0V4FeP8bvzO2Dq75RXu2/dJtQV7WJBOMLS/hK4nr+cTC5kgKSgkMQ5OUPg1xm7ioyGaik74xc+wXHwmLqZp9WHsN4K1v/HzKtl2bH+vN7ZrYoaBtOMc5U8swRAE8MEIj55GLjqLo+DQkLZpSkoycsKE+c/DJLfXntrIfaK/YwN+9/qv577a/eVdeDGS0GSD8EBOSUcJGkeGij+cqEoYFEizLwjYt6pIWaXP02tr07CNaRp2dZT/Rnx3gb9/4h5NXdLz9WFb2m2YQ4Zhxx/PQmmeoqTVAB0TsEKGwxkDgKQ14VMYlZcao/qbyQ0+cWPNJeEuKL4SWvbHsS74c+EYgu6tDMqZT4dTa8nDTHacfdOlrB9QSvn3RbePe3fH620NioHzB1ItIhxMs/uBlFne+T8sYQcoQ+K5LNGYQBBrXg2RIMzodZUz0sPPnTbjuzo+3d/eqWw/ZuGPd3bu8zsmG7VAZtVBIhHBxc1FS5thF4+smn7Ng6gV/saO+f7aayJu9rxqbdq+9v6CGy0HQWFZPVbqGNQPv0VYUWEaANDTC+DCDLAQYAtOQlMmmnkPGn3rvJ2zo2zcdtqrzzdc6VcfkgIAqs3agQjQ/X2U0vmrrTFGFHTaX1nxuZefydU9suHPGfr+E33x7ycLuQtdsOxYpzIgddd3Tyx4/sTu/4wvaUJiMvAUkpSAUDgEKp+SBIbEtEymNJ8Oi5aNzfs+t/5391rbX/2W3HojGRZKGzJi/n9Y858aTm87wAF5s/X3FqtZ19/Tr1Sdm1bayLb3BQ29sfWXWEc3HDe+3M7DP67rGk0UmmtOu+9YXrvlV/1D/XX1yB0mSVIU1vm/iuh6u6wMC07IwTYllGMTs1CeyKLuKXV/3Y73NmZDFuPhBF3/n6Jt+ugcewAljz+s7aPKRX5qamrEyHYNdtE9ctf2p7+23S/jRVfc07HK7JsVkjEkNLU8CWJHQIXGdZlbTHMqiEQoFH4QYqagphRABCA2BIGp+slCXdbJHaAQN4eo1Fx5zxm/2fL94+UupZ996tALghPpTVH11wzUhX4A2yQa7L35/+I+p/RLgW8tfL/OVI1JWOdlitgMgHknsGpOYcMHyrcuXqcCjYxCkIfDVyKlnIUxA4AWKbGH7J5yZGxSGR950r1sfF5M+CqRFRGd2lXb8zZ7PZ7Vc9rISZcVCQdE5vDvx6lvvNu6XAJuqxxctYWlDsO6r8y7QAD8+5ec3TR8z/Sl84yDT9GjLeeR9ExOBj0IJH9cR5AOXYeV/7uPt1cfrl4JmKBhs3q3bPxrjpuEVh2RL/ZFPdO7bKK1xTYeqZP2U/RLgZfOv3twQnvmm5aR+9YmMTOu75w3IfivuWWqSmVLrOgOUYeC5AYGWWKYk70NXvuuItzr/ae6e5w6bdvS9461Dn93W2z7nVy/c+tI/vvrTv//Zq9d+v3NXz22VNbX377nv+c23N+vQQDgTlVSGY5SsXSv2Wyfy49N+duQN59xy+ydsWSn/Ja2hMd30z0ePnnrV0LDBtrwmZIUJAtDCRwHbS0PGhu5196za+dBogGbzSO/CuT/+YlPZoReVGA625toX5IP89Jq62hPPPviijypurQPb/95XJVmUDklZ2zb/oDPaPmuAezWZcN7vz+5qzIxbniDy03hFbMeiLS92rBv2OKgpQl1iCIWNQmP4IE2XsnBdT1Ns+qWnTrvkUVtE/mQSYWNhUfjV1a/+YFvp3etKgKktxkdnnXnhYT98+IAC+JU7T94xPjrj+usX/OQfARbed8H6gtff0ltQpGsUY9MlLDSeqQicECHLBx2lMlS7LmKEH6myq98qi4zeFonE2FXaSTafHdOX751rGIOXdjudaSVGtoKj7UPvuHTuDX97QCVUAartujW5Qja953NtxH5OxMc/9PkpE156Ze3iF5cNFWIT62zK8BFm8OHpqgLdpdYpUhpTthU2Y8nlGJgo5VEUBUwUnmdimB6msvWY6Oy7pzW3XHBA5gO7c93mlvbN4SOnHzUM8A8v3zJpU0fr478577bJ33nk2rPf3v3+/T3FgOrygIZMiEwMhPZRWmEqE1/7YGikMFCBxpAjr+0LqagQzZsby5u/+9Vp33n0gM9If1y/ePCXp1+54IrHinpAfPuua1/vEL0z4yLVvn2we2okKqhOQCimCYcUIdNACBOtFYGGkquw3JSeXD3hooMmzbjz6Mxp/n+LlP6f0h1v3jVme2fn1LNO/soztz9zx2UD+aGFR83+q4veWr3k2xuGtpxVFclsT4jI9r5i9uCyUMVAPBQ5vy4xZu33Trm4i//Rn1ab3ikuuffKo75734+PAnil+93YM1uWRPfFsf5ftgcwjnAYPg8AAAAASUVORK5CYII=">
      
            <v-dialog v-model="showProjectConfig" persistent content-class="vdialognew" overlay-opacity='0'>
              <template v-slot:activator="{ on, attrs }">
              <v-btn text outlined color="darkgrey" v-bind="attrs" v-on="on" style='height:60px;min-width: 100%!important;'>
                  <v-icon>mdi-application-cog-outline</v-icon>
                </v-btn>
              </template>
              <config-project :projectDirectory.sync="pathConfig" v-on:done="doneConfig" />
            </v-dialog>
    <v-item-group
        v-model="window"
        mandatory
      >
        <v-item v-slot="{active, toggle }">
            <v-btn text outlined :color="active?'teal':'darkgrey'" @click="toggle" style='height:60px;min-width: 100%!important;'>
              <v-icon>mdi-folder-multiple-image</v-icon>
            </v-btn>
        </v-item>
        <v-item v-slot="{active, toggle }">
            <v-btn text outlined :color="active?'teal':'darkgrey'" @click="toggle" style='height:60px;min-width: 100%!important;'>
              <v-icon>mdi-notebook-edit</v-icon>
            </v-btn>
        </v-item>
      </v-item-group>
       <template v-slot:append>
        <div>
          <v-btn text outlined color="darkgrey" style='height:60px;min-width: 100%!important;' @click="save_json">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-btn text outlined color="darkgrey" style='height:60px;min-width: 100%!important;' @click="toggleDarkMode">
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
        </div>
      </template>
      </v-navigation-drawer>
      <div style="position:absolute;height:100vh;left:60px;right:0" >
    <splitpanes class="customsplit" @resized="fireResizeEvent">
      <pane size="17">
        <v-window
          v-model="window"
          vertical
        >
          <v-window-item style="height:100vh">
            <list-files :file-path.sync="imageFilePath" :directory.sync="directory" :file-extensions="['.png', '.jpg', '.jpeg', '.mrxs', '.tif', '.tiff', '.svs']"/>
          </v-window-item>
          <v-window-item style="height:100vh">
            <custom-labels :template="templateAnnotations" :annotations.sync="annotations" style="height:100%;padding:10px;overflow-y:auto" /> 
          </v-window-item>
        </v-window>
      </pane>

      <pane v-bind:style="{ backgroundColor: $vuetify.theme.dark?'#222':'#eee'}">
        <viewer-open-seadragon :file-path="imageFilePath" :osd.sync="osd" />
      </pane>

      <pane size="17" min-size="17" style="overflow:auto; height:100%;display:flex;flex-direction:column">

        <div style="width:100%;min-height: 250px;max-height: 250px;"><div id="view-nav" style="width:100%;height:100%;background-color:#424242"></div></div>
        <annotation-open-seadragon :osd="osd" :get-label-boxes.sync="getBoxes" :set-label-boxes.sync="setBoxes" :labels="labels" style="height: 100%;"/>
        <v-row align="center" justify="space-around">
  </v-row>
      </pane>
    </splitpanes>
      </div>

  </v-app>
</template>

<script>
  import ViewerOpenSeadragon from '@/components/ViewerOpenSeadragon.vue'
  import AnnotationOpenSeadragon from '@/components/AnnotationOpenSeadragon.vue'
  import customLabels from '@/components/customLabels.vue'
  import ConfigProject from '@/components/ConfigProject.vue'
  import ListFiles from '@/components/ListFiles.vue'
  import { Splitpanes, Pane } from 'splitpanes'
  import 'splitpanes/dist/splitpanes.css'
  import axios from 'axios'
//  import json_file from "./components/label.json";
  export default {
    components: {
        Splitpanes, Pane,
        ViewerOpenSeadragon,
        AnnotationOpenSeadragon,
        customLabels,
        ConfigProject,
        ListFiles,
    },
    data: () => ({
      imageFilePath:undefined,
      directory: localStorage.directory?localStorage.directory:'/home/',
      osd:undefined,
      getBoxes:()=>{},
      setBoxes:()=>{},
      labels:[],
      templateAnnotations:{},
      showProjectConfig: true,
      window: undefined,
      pathConfig: localStorage.directory?localStorage.pathConfig:'/home/',
      annotations:{}
    }),
    methods: {
      doneConfig(data){
        this.templateAnnotations = data;
        this.showProjectConfig = false;
        this.labels = data.colorsLabels.map((l,i)=>{l.id=i;return l});
      },
      fireResizeEvent(){
        window.dispatchEvent(new Event('resize'));
      },
      load_json(){

          //this.$store.state.setBoxLabels()
      },
      save_json(){
        var filepath = this.pathConfig+"annot_" + this.imageFilePath.substr(this.imageFilePath.lastIndexOf('/')+1,this.imageFilePath.lastIndexOf('.')-this.imageFilePath.lastIndexOf('/')-1) +".json"
        axios.post(this.$request_base_url + "/write_json",{filepath:filepath,data:{path:this.imageFilePath,boxes:this.getBoxes(),annotations:this.annotations}}, {
            headers: {'Content-Type': 'application/json'}
        }).catch((error) => {
            console.error(error);
        });
      },
    toggleDarkMode: function() {
        this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        localStorage.setItem("darkTheme", this.$vuetify.theme.dark.toString());
    }
    },
    watch:{
      directory(){
        localStorage.directory = this.directory;
      },
      pathConfig(){
        localStorage.pathConfig = this.pathConfig;
      },
      imageFilePath(){
        this.window = 1
        var filepath = this.pathConfig+"annot_" + this.imageFilePath.substr(this.imageFilePath.lastIndexOf('/')+1,this.imageFilePath.lastIndexOf('.')-this.imageFilePath.lastIndexOf('/')-1) +".json"
        axios.post(this.$request_base_url + "/read_json",{filepath:filepath}, {
            headers: {'Content-Type': 'application/json'}
        }).then(res=>{
          this.annotations = res.data.annotations;
          this.setBoxes(res.data.boxes);
        }).catch((error) => {
          console.error(error);
            this.annotations = {};
            this.setBoxes([]);
        });
      }
    },
    mounted() {

      this.$vuetify.theme.themes.light.primary = '#009688'
      this.$vuetify.theme.themes.dark.primary = '#009688'

      this.fireResizeEvent()
      this.load_json();
      if(localStorage.directory)
        this.directory = localStorage.directory;


      const theme = localStorage.getItem("darkTheme");

      // Check if the user has set the theme state before
      if (theme) {
          if (theme === "true") {
              this.$vuetify.theme.dark = true;
          } else {
              this.$vuetify.theme.dark = false;
          }
      } else if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
          this.$vuetify.theme.dark = true;
          localStorage.setItem(
              "darkTheme",
              this.$vuetify.theme.dark.toString()
          );
      }
    },
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.vdialognew{
  margin:0 0 0 57px!important;
  width: calc(100% - 57px)!important;
  height:100vh;
  max-height: 100vh!important;
}
.customsplit {background-color: #f8f8f8;}

.splitpanes__splitter {background-color: #ccc;position: relative;}
.splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.7s;
  background-color: rgba(0, 148, 133, 0.295);
  opacity: 0;
  z-index: 1;
}
.splitpanes__splitter:hover:before {opacity: 1;}
.splitpanes--vertical > .splitpanes__splitter:before {left: -4px;right: -4px;height: 100%;}
.splitpanes--horizontal > .splitpanes__splitter:before {top: -4px;bottom: -4px;width: 100%;}
</style>
